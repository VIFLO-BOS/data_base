import { apiClient } from './api-client';

export type AssignmentStatus =
  | 'active'
  | 'achieved'
  | 'disqualified'
  | 'removed'
  | 'inactive';

export async function replaceAccountProjectTaskers(
  accountId: string,
  projectId: string,
  taskerIds: string[],
) {
  const { data } = await apiClient.post(
    `/assignments/accounts/${accountId}/projects/${projectId}/taskers`,
    { taskerIds },
  );
  return data.data;
}

export async function updateAssignmentStatus(
  accountId: string,
  projectId: string,
  taskerId: string,
  status: AssignmentStatus,
) {
  const { data } = await apiClient.patch(
    `/assignments/accounts/${accountId}/projects/${projectId}/taskers/${taskerId}`,
    { status },
  );
  return data.data;
}
