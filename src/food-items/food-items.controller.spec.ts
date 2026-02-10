import { Test, TestingModule } from '@nestjs/testing';
import { FoodItemsController } from './food-items.controller';
import { FoodItemsService } from './food-items.service';

describe('FoodItemsController', () => {
  let controller: FoodItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodItemsController],
      providers: [
        {
          provide: FoodItemsService,
          useValue: {
            create: jest.fn(),
            findAllByKitchen: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            setAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FoodItemsController>(FoodItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
