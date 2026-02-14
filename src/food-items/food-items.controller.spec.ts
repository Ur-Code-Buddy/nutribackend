import { Test, TestingModule } from '@nestjs/testing';
import { FoodItemsController } from './food-items.controller';
import { FoodItemsService } from './food-items.service';
import { KitchensService } from '../kitchens/kitchens.service';
import { NotFoundException } from '@nestjs/common';

describe('FoodItemsController', () => {
  let controller: FoodItemsController;
  let kitchensService: KitchensService;
  let foodItemsService: FoodItemsService;

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
        {
          provide: KitchensService,
          useValue: {
            findByOwner: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FoodItemsController>(FoodItemsController);
    kitchensService = module.get<KitchensService>(KitchensService);
    foodItemsService = module.get<FoodItemsService>(FoodItemsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyItems', () => {
    it('should return items for user kitchen', async () => {
      const mockResult = [{ id: '1', name: 'Test Item' }];
      const mockKitchen = { id: 'kitchen-id', owner_id: 'user-id' };

      jest
        .spyOn(kitchensService, 'findByOwner')
        .mockResolvedValue(mockKitchen as any);
      jest
        .spyOn(foodItemsService, 'findAllByKitchen')
        .mockResolvedValue(mockResult as any);

      expect(await controller.getMyItems({ user: { userId: 'user-id' } })).toBe(
        mockResult,
      );
      expect(kitchensService.findByOwner).toHaveBeenCalledWith('user-id');
      expect(foodItemsService.findAllByKitchen).toHaveBeenCalledWith(
        'kitchen-id',
      );
    });

    it('should throw NotFoundException if no kitchen found', async () => {
      jest.spyOn(kitchensService, 'findByOwner').mockResolvedValue(null);
      await expect(
        controller.getMyItems({ user: { userId: 'user-id' } }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
