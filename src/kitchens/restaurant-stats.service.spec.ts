import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getDataSourceToken } from '@nestjs/typeorm';
import { RestaurantStatsService } from './restaurant-stats.service';

function mockFullStatsQuery(
  query: jest.Mock,
  agg: { avg: string | null; total: string },
  globalAvg: { avg: string | null },
) {
  query
    .mockResolvedValueOnce([{ c: '12' }])
    .mockResolvedValueOnce([{ c: '7' }])
    .mockResolvedValueOnce([agg])
    .mockResolvedValueOnce([{ stars: '5', c: '10' }])
    .mockResolvedValueOnce([{ name: 'Dal', avg_stars: '4.666666', cnt: '9' }])
    .mockResolvedValueOnce([globalAvg]);
}

describe('RestaurantStatsService', () => {
  let service: RestaurantStatsService;
  let query: jest.Mock;

  beforeEach(async () => {
    query = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantStatsService,
        {
          provide: getDataSourceToken(),
          useValue: { query },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((_key: string, def?: unknown) => def),
          },
        },
      ],
    }).compile();

    service = module.get(RestaurantStatsService);
  });

  it('aggregates stats from parallel queries', async () => {
    mockFullStatsQuery(query, { avg: '4.256', total: '22' }, { avg: '4.0' });

    const result = await service.getStats('kitchen-uuid');

    expect(result.total_orders).toBe(12);
    expect(result.total_customers).toBe(7);
    expect(result.total_ratings).toBe(22);
    expect(result.average_rating).toBe(4.26);
    // (22/(22+10))*4.256 + (10/(22+10))*4.0
    expect(result.weighted_average_rating).toBe(4.18);
    expect(result.rating_distribution['5']).toBe(10);
    expect(result.top_items[0].name).toBe('Dal');
  });

  it('returns null averages when no ratings', async () => {
    query
      .mockResolvedValueOnce([{ c: '0' }])
      .mockResolvedValueOnce([{ c: '0' }])
      .mockResolvedValueOnce([{ avg: null, total: '0' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ avg: null }]);

    const result = await service.getStats('kitchen-uuid');

    expect(result.average_rating).toBeNull();
    expect(result.weighted_average_rating).toBeNull();
    expect(result.total_ratings).toBe(0);
    expect(result.top_items).toEqual([]);
  });

  it('weighted_average_rating ranks high volume above few perfect scores', async () => {
    const global = { avg: '4.0' };
    const m = 10;

    mockFullStatsQuery(query, { avg: '5', total: '2' }, global);
    const few = await service.getStats('k1');

    mockFullStatsQuery(query, { avg: '4.8', total: '50' }, global);
    const many = await service.getStats('k2');

    expect(few.average_rating).toBe(5);
    expect(many.average_rating).toBe(4.8);
    // 2 @ 5 vs prior 4: pulled down
    const wFew = (2 / (2 + m)) * 5 + (m / (2 + m)) * 4;
    expect(few.weighted_average_rating).toBe(Math.round(wFew * 100) / 100);
    // 50 @ 4.8 stays near 4.8
    const wMany = (50 / (50 + m)) * 4.8 + (m / (50 + m)) * 4;
    expect(many.weighted_average_rating).toBe(Math.round(wMany * 100) / 100);
    expect(many.weighted_average_rating!).toBeGreaterThan(
      few.weighted_average_rating!,
    );
  });
});
