import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { WeaviateModule } from './weaviate/weaviate.module';
import { CrawlerModule } from './crawler/crawler.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    WeaviateModule,
    CrawlerModule,
    MonitoringModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}