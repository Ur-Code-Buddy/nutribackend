import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';

import { ConfigService } from '@nestjs/config';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key) => {
              if (key === 'AWS_REGION') return 'us-east-1';
              if (key === 'AWS_BUCKET_NAME') return 'test-bucket';
              if (key === 'AWS_ACCESS_KEY_ID') return 'test-key';
              if (key === 'AWS_SECRET_ACCESS_KEY') return 'test-secret';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
