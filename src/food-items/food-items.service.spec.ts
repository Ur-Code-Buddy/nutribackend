import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FoodItemsService } from './food-items.service';
import { FoodItem } from './entities/food-item.entity';
import { FoodItemAvailability } from './entities/food-item-availability.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

describe('FoodItemsService', () => {
  let service: FoodItemsService;
  let find: jest.Mock;
  let findOne: jest.Mock;
  let availabilityFind: jest.Mock;
  let createQueryBuilder: jest.Mock;

  function tomorrowYmd() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  beforeEach(async () => {
    find = jest.fn();
    findOne = jest.fn();
    availabilityFind = jest.fn();
    const getRawMany = jest.fn().mockResolvedValue([]);
    createQueryBuilder = jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany,
    });

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
        {
          provide: getRepositoryToken(FoodItemAvailability),
          useValue: {
            find: availabilityFind,
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            createQueryBuilder,
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

    it('adds remaining_daily_orders when scheduled_for is valid', async () => {
      const date = tomorrowYmd();
      const item = {
        id: 'i1',
        kitchen_id: 'k1',
        max_daily_orders: 10,
        is_available: true,
      } as FoodItem;
      find.mockResolvedValue([item]);
      availabilityFind.mockResolvedValue([]);
      const getRawMany = jest.fn().mockResolvedValue([
        { food_item_id: 'i1', sold: '3' },
      ]);
      createQueryBuilder.mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany,
      });

      const result = await service.findAvailableByKitchen('k1', date);
      expect(result[0].remaining_daily_orders).toBe(7);
    });

    it('throws when scheduled_for is out of range', async () => {
      find.mockResolvedValue([
        { id: 'i1', kitchen_id: 'k1', max_daily_orders: 10 } as FoodItem,
      ]);
      await expect(
        service.findAvailableByKitchen('k1', '2000-01-01'),
      ).rejects.toThrow(BadRequestException);
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
