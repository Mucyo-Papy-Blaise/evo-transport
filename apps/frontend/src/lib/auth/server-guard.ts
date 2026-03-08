import { redirect } from 'next/navigation';
import { AccessControlService } from '../Access-control-service';
import type { ResourceAction, AccessResult, AccessContext } from '../types/access-control';


// Returns the result; caller decides whether to throw or handle gracefully.
export function guardAction(
  action: ResourceAction,
  context: AccessContext,
): AccessResult {
  return AccessControlService.can(action, context);
}

// Strict guard: throws a descriptive error if access is denied.
export function requireActionOrThrow(
  action: ResourceAction,
  context: AccessContext,
): void {
  const result = AccessControlService.can(action, context);
  if (!result.granted) {
    throw new Error(result.reason ?? 'Access denied.');
  }
}

//  export default async function ApproveLoanPage() {
export async function requireAction(
  action: ResourceAction,
  context: AccessContext,
  redirectPath = '/unauthorized',
): Promise<void> {
  const result = AccessControlService.can(action, context);
  if (!result.granted) {
    redirect(redirectPath);
  }
}

// Checks organization status and redirects if suspended/closed.
export async function requireActiveOrganization(
  context: AccessContext,
  redirectPath = '/suspended',
): Promise<void> {
  if (!context.organization) return;
  if (!AccessControlService.isOrganizationActive(context.organization)) {
    redirect(redirectPath);
  }
}