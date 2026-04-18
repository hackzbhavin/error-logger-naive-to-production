import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsController } from '../errors.controller';
import { ErrorsService } from '../errors.service';

describe('ErrorsController', () => {
  let controller: ErrorsController;
  let service: { log: jest.Mock };

  beforeEach(async () => {
    service = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ErrorsController],
      providers: [{ provide: ErrorsService, useValue: service }],
    }).compile();

    controller = module.get(ErrorsController);
  });

  it('returns { status: "saved" } after logging', async () => {
    const result = await controller.log({ message: 'Test error' });
    expect(result).toEqual({ status: 'saved' });
  });

  it('delegates to ErrorsService.log with the dto', async () => {
    const dto = { message: 'Test error', stackTrace: 'at foo (bar.ts:1)' };
    await controller.log(dto);
    expect(service.log).toHaveBeenCalledWith(dto);
  });
});
