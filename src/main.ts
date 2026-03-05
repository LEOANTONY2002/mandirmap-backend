import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ?? 5000;
  console.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
