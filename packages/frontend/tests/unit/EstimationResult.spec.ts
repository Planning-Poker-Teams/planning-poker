import { VueWrapper, DOMWrapper } from '@vue/test-utils';
import { describe, expect, it, beforeEach } from 'vitest';
import EstimationResult from '../../src/components/EstimationResult.vue';
import {
  EstimationResult as IEstimationResult,
  Participant as IParticipant,
} from '../../src/store/types';
import createWrapper from './helper';

const estimationResult: IEstimationResult = {
  taskName: 'test-task',
  startDate: new Date(),
  endDate: new Date(),
  estimates: [
    { userName: 'Hank', estimate: '2' },
    { userName: 'Jessie', estimate: '18' },
    { userName: 'Walter', estimate: '10' },
    { userName: 'Saul', estimate: '10' },
  ],
};

const participants: IParticipant[] = [
  { name: 'Hank', isSpectator: false, hasEstimated: true },
  { name: 'Jessie', isSpectator: false, hasEstimated: true },
  { name: 'Walter', isSpectator: false, hasEstimated: true },
  { name: 'Saul', isSpectator: false, hasEstimated: true },
];

let wrapper: VueWrapper;
let tableHeaders: DOMWrapper<Element>[];

describe('estimation result', () => {
  beforeEach(() => {
    wrapper = createWrapper(
      EstimationResult,
      {},
      {
        estimationResult,
        cardDeck: ['0, 1, 2, 3, 5, 8, 10, 13, 18'],
        participants,
      }
    ).wrapper;

    tableHeaders = wrapper.findAll('thead a');
  });

  it('should sort estimations according to their job-size', async () => {
    const estimationRows = wrapper.findAll('tbody > tr').map(tr => tr.text());

    expect(estimationRows[0]).toContain('Jessie');
    expect(estimationRows[1]).toContain('Saul');
    expect(estimationRows[1]).toContain('Walter');
    expect(estimationRows[2]).toContain('Hank');
  });

  it('should sort estimations according to their voters count DESC on click', async () => {
    await tableHeaders[1].trigger('click');
    const estimationRows = wrapper.findAll('tbody > tr').map(tr => tr.text());

    expect(estimationRows[0]).toContain('Walter');
    expect(estimationRows[0]).toContain('Saul');
    expect(estimationRows[1]).toContain('Jessie');
    expect(estimationRows[2]).toContain('Hank');
  });

  it('should sort estimations according to their voters count ASC on double click', async () => {
    await tableHeaders[1].trigger('click');
    await tableHeaders[1].trigger('click');
    const estimationRows = wrapper.findAll('tbody > tr').map(tr => tr.text());

    expect(estimationRows[0]).toContain('Hank');
    expect(estimationRows[1]).toContain('Jessie');
    expect(estimationRows[2]).toContain('Walter');
    expect(estimationRows[2]).toContain('Saul');
  });
});
