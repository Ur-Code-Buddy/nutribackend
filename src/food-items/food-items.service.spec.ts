import { Test, TestingModule } from '@nestjs/testing';
import { FoodItemsService } from './food-items.service';

describe('FoodItemsService', () => {
  let service: FoodItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodItemsService,
        {
          provide: 'FoodItemRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: 'FoodItemAvailabilityRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodItemsService>(FoodItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
