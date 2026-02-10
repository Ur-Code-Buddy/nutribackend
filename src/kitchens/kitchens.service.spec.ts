import { Test, TestingModule } from '@nestjs/testing';
import { KitchensService } from './kitchens.service';

describe('KitchensService', () => {
  let service: KitchensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KitchensService,
        {
          provide: 'KitchenRepository',
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KitchensService>(KitchensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
