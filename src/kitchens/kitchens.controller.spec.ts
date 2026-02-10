import { Test, TestingModule } from '@nestjs/testing';
import { KitchensController } from './kitchens.controller';
import { KitchensService } from './kitchens.service';

describe('KitchensController', () => {
  let controller: KitchensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KitchensController],
      providers: [
        {
          provide: KitchensService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<KitchensController>(KitchensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
