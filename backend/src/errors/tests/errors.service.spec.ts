import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorsService } from '../errors.service';
import { ErrorEvent } from '../errors.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

describe('ErrorsService', () => {
  let service: ErrorsService;
  let repo: jest.Mocked<Repository<ErrorEvent>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ErrorsService,
        { provide: getRepositoryToken(ErrorEvent), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(ErrorsService);
    repo = module.get(getRepositoryToken(ErrorEvent));
  });

  it('inserts a new error when fingerprint is unseen', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockResolvedValue({} as ErrorEvent);

    await service.log({ message: 'TypeError: x is undefined' });

    expect(repo.findOne).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ count: 1 }),
    );
  });

  it('increments count when fingerprint already exists', async () => {
    const existing = { id: 1, count: 3, lastSeenAt: new Date() } as ErrorEvent;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockResolvedValue(existing);

    await service.log({ message: 'TypeError: x is undefined' });

    expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ count: 4 }));
  });

  it('same message always produces the same fingerprint', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockResolvedValue({} as ErrorEvent);

    await service.log({ message: 'ReferenceError: foo is not defined' });
    await service.log({ message: 'ReferenceError: foo is not defined' });

    const firstCall = repo.findOne.mock.calls[0][0] as { where: { fingerprint: string } };
    const secondCall = repo.findOne.mock.calls[1][0] as { where: { fingerprint: string } };
    expect(firstCall.where.fingerprint).toBe(secondCall.where.fingerprint);
  });

  it('different messages produce different fingerprints', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.save.mockResolvedValue({} as ErrorEvent);

    await service.log({ message: 'Error A' });
    await service.log({ message: 'Error B' });

    const firstCall = repo.findOne.mock.calls[0][0] as { where: { fingerprint: string } };
    const secondCall = repo.findOne.mock.calls[1][0] as { where: { fingerprint: string } };
    expect(firstCall.where.fingerprint).not.toBe(secondCall.where.fingerprint);
  });
});
