import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { User } from '../src/database/entities';

describe('Auth sessions (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwt: JwtService;
  const createdUserIds: string[] = [];

  const email = () => `e2e-${randomUUID()}@example.com`;
  const password = 'Str0ng-passw0rd';

  const register = async (userEmail = email()) => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: userEmail, password })
      .expect(201);
    createdUserIds.push(res.body.user.id);
    return { email: userEmail, ...res.body } as {
      email: string;
      token: string;
      session_id: string;
      user: { id: string };
    };
  };

  const whoAmI = (token: string) =>
    request(app.getHttpServer())
      .get('/api/profiles/me')
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleRef.createNestApplication({ rawBody: true }));
    await app.init();
    dataSource = app.get(DataSource);
    jwt = app.get(JwtService);
  });

  afterAll(async () => {
    if (createdUserIds.length) {
      await dataSource.getRepository(User).delete(createdUserIds);
    }
    await app.close();
  });

  it('rejects unauthenticated requests to protected routes', async () => {
    await request(app.getHttpServer()).get('/api/profiles/me').expect(401);
  });

  it('rejects unknown properties on public DTOs', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: email(), password, is_admin: true })
      .expect(400);
  });

  it('issues a token bound to a persisted session', async () => {
    const { token, session_id, user } = await register();

    const payload = jwt.decode(token) as Record<string, unknown>;
    expect(payload.sub).toBe(user.id);
    expect(payload.sid).toBe(session_id);

    const rows = await dataSource.query(
      'SELECT id FROM user_sessions WHERE user_id = $1',
      [user.id],
    );
    expect(rows.map((r: { id: string }) => r.id)).toEqual([session_id]);

    await whoAmI(token).expect(200);
  });

  it('revokes the token on logout even though the JWT is unexpired', async () => {
    const { token } = await register();
    await whoAmI(token).expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);

    await whoAmI(token).expect(401);
  });

  it('logout {all:true} revokes every device session, plain logout only the current one', async () => {
    const first = await register();
    const login = () =>
      request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: first.email, password })
        .expect(200)
        .then((r) => r.body.token as string);

    const second = await login();
    const third = await login();

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${second}`)
      .send({})
      .expect(200);
    await whoAmI(second).expect(401);
    await whoAmI(first.token).expect(200);
    await whoAmI(third).expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${third}`)
      .send({ all: true })
      .expect(200);
    await whoAmI(first.token).expect(401);
    await whoAmI(third).expect(401);
  });

  it('rejects a forged token that has no session id', async () => {
    const { user } = await register();
    const forged = jwt.sign({ sub: user.id, email: null, phone: null });

    await whoAmI(forged).expect(401);
  });

  it('rejects a valid-looking token whose session id does not exist', async () => {
    const { user } = await register();
    const forged = jwt.sign({
      sub: user.id,
      sid: randomUUID(),
      email: null,
      phone: null,
    });

    await whoAmI(forged).expect(401);
  });

  it('rejects wrong credentials and duplicate registration', async () => {
    const { email: existing } = await register();

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: existing, password: 'wrong-password' })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: existing, password })
      .expect(409);
  });

  it('answers forgot-password identically for unknown accounts', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({ email: email() })
      .expect(200);

    expect(res.body).toEqual({
      message: 'If an account exists, a reset code has been sent',
    });
  });
});
