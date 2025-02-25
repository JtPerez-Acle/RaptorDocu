/**
 * Response interface for crawl operations
 */
export interface CrawlResponse {
  /**
   * Unique identifier for the crawl job
   */
  jobId: string;
  
  /**
   * Current status of the crawl job
   */
  status: string;
  
  /**
   * URL that was crawled
   */
  url: string;
  
  /**
   * Number of pages crawled
   */
  pageCount: number | null;
  
  /**
   * Number of pages embedded
   */
  embeddedCount: number | null;
  
  /**
   * Number of pages summarized
   */
  summarizedCount: number | null;
}