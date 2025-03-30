import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as multer from 'multer';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    credentials: true,
  });

  // app.use((req: { headers: any; body: any; }, res: any, next: () => void) => {
  //   console.log('Raw request headers:', req.headers);
  //   console.log('Raw request body:', req.body);
  //   next();
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
