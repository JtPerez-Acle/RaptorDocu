import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { WeaviateService } from './service/weaviate.service';
import { WeaviateCacheService } from './service/weaviate-cache.service';
import { SearchController } from './controllers/search.controller';

@Module({
  imports: [
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default
      max: 100, // Maximum number of items in cache
      isGlobal: false,
    }),
  ],
  controllers: [SearchController],
  providers: [WeaviateService, WeaviateCacheService],
  exports: [WeaviateService, WeaviateCacheService],
})
export class WeaviateModule {}