import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { OrdersService } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { FoodItem } from '../food-items/entities/food-item.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(FoodItem),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getQueueToken('orders'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should calculate total_price correctly', async () => {
    const foodItem = {
      id: 'item-1',
      price: 10,
      active: true,
      max_daily_orders: 100,
      availability: [],
    };
    const createDto = {
      kitchen_id: 'kitchen-1',
      scheduled_for: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      items: [{ food_item_id: 'item-1', quantity: 2 }],
    };

    const mockOrdersRepo = module.get(getRepositoryToken(Order));
    const mockFoodItemRepo = module.get(getRepositoryToken(FoodItem));
    const mockOrdersQueue = module.get(getQueueToken('orders'));

    mockFoodItemRepo.findOne.mockResolvedValue(foodItem);
    mockOrdersRepo.create.mockImplementation((dto: any) => dto);
    mockOrdersRepo.save.mockImplementation((order: any) => Promise.resolve({ ...order, id: 'order-1' }));

    const result = await service.create('client-1', createDto as any);

    expect(result.total_price).toBe(20);
    expect(mockOrdersRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        total_price: 20,
      }),
    );
  });

  it('should accept orders for tomorrow (1 day in advance)', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const createDto = {
      kitchen_id: 'kitchen-1',
      scheduled_for: dateStr,
      items: [{ food_item_id: 'item-1', quantity: 1 }],
    };

    setupMocks();

    const result = await service.create('client-1', createDto as any);
    expect(result).toBeDefined();
  });

  it('should accept orders for 3 days in advance', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const dateStr = future.toISOString().split('T')[0];

    const createDto = {
      kitchen_id: 'kitchen-1',
      scheduled_for: dateStr,
      items: [{ food_item_id: 'item-1', quantity: 1 }],
    };

    setupMocks();

    const result = await service.create('client-1', createDto as any);
    expect(result).toBeDefined();
  });

  it('should reject orders for today', async () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const createDto = {
      kitchen_id: 'kitchen-1',
      scheduled_for: dateStr,
      items: [{ food_item_id: 'item-1', quantity: 1 }],
    };

    await expect(service.create('client-1', createDto as any)).rejects.toThrow(
      'Orders must be placed for 1 to 3 days in advance.',
    );
  });

  it('should reject orders for 4 days in advance', async () => {
    const future = new Date();
    future.setDate(future.getDate() + 4);
    const dateStr = future.toISOString().split('T')[0];

    const createDto = {
      kitchen_id: 'kitchen-1',
      scheduled_for: dateStr,
      items: [{ food_item_id: 'item-1', quantity: 1 }],
    };

    await expect(service.create('client-1', createDto as any)).rejects.toThrow(
      'Orders must be placed for 1 to 3 days in advance.',
    );
  });


  it('should set accepted_at when order is accepted', async () => {
    const orderId = 'order-1';
    const mockOrder = {
      id: orderId,
      status: 'PENDING',
      accepted_at: null,
    };

    const mockOrdersRepo = module.get(getRepositoryToken(Order));
    mockOrdersRepo.findOne.mockResolvedValue(mockOrder);
    mockOrdersRepo.save.mockImplementation((order: any) => Promise.resolve({ ...order }));

    const result = await service.updateStatus(orderId, OrderStatus.ACCEPTED);

    expect(result.status).toBe(OrderStatus.ACCEPTED);
    expect(result.accepted_at).toBeDefined();
    expect(result.accepted_at instanceof Date).toBeTruthy();
  });

  function setupMocks() {
    const foodItem = {
      id: 'item-1',
      price: 10,
      active: true,
      max_daily_orders: 100,
      availability: [],
    };
    const mockOrdersRepo = module.get(getRepositoryToken(Order));
    const mockFoodItemRepo = module.get(getRepositoryToken(FoodItem));

    mockFoodItemRepo.findOne.mockResolvedValue(foodItem);
    mockOrdersRepo.create.mockImplementation((dto: any) => dto);
    mockOrdersRepo.save.mockImplementation((order: any) => Promise.resolve({ ...order, id: 'order-1' }));
  }
});
