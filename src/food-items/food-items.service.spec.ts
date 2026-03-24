import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FoodItemsService } from './food-items.service';
import { FoodItem } from './entities/food-item.entity';

describe('FoodItemsService', () => {
  let service: FoodItemsService;
  let find: jest.Mock;
  let findOne: jest.Mock;

  beforeEach(async () => {
    find = jest.fn();
    findOne = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodItemsService,
        {
          provide: getRepositoryToken(FoodItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find,
            findOne,
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FoodItemsService>(FoodItemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAvailableByKitchen', () => {
    it('filters to is_available true', async () => {
      find.mockResolvedValue([]);
      await service.findAvailableByKitchen('k1');
      expect(find).toHaveBeenCalledWith({
        where: { kitchen_id: 'k1', is_available: true },
      });
    });
  });

  describe('findOnePublic', () => {
    it('returns item when available', async () => {
      const item = { id: 'i1', is_available: true };
      findOne.mockResolvedValue(item);
      await expect(service.findOnePublic('i1')).resolves.toBe(item);
      expect(findOne).toHaveBeenCalledWith({
        where: { id: 'i1', is_available: true },
      });
    });

    it('throws when unavailable or missing', async () => {
      findOne.mockResolvedValue(null);
      await expect(service.findOnePublic('i1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
