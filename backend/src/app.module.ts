import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeaviateModule } from './weaviate/weaviate.module';
import { CrawlerModule } from './crawler/crawler.module';
import { MonitoringModule } from './monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    WeaviateModule,
    CrawlerModule,
    MonitoringModule,
  ],
})
export class AppModule {}