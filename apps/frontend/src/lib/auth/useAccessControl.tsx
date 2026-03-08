'use client';

import { useCallback } from 'react';
import { AccessControlService } from '../Access-control-service';
import type { ResourceAction, AccessResult, AccessContext } from '../types/access-control';
import type { NavGroup } from '../types/navigations';
import { useDashboard } from '../providers/dashboard-provider';




export function useAccessControl() {
  const { user, organization } = useDashboard();

  // Build the AccessContext for the current user
  const buildContext = useCallback(
    (overrides?: Partial<AccessContext>): AccessContext => ({
      role: user.currentRole,
      branchId: user.branchId,
      organization,
      ...overrides,
    }),
    [user, organization]
  );

  // Full check with denial reason.
  const can = useCallback(
    (action: ResourceAction, opts?: { resourceBranchId?: string | null }): AccessResult => {
      return AccessControlService.can(action, buildContext(opts));
    },
    [buildContext]
  );

  // Boolean shorthand
  const isAllowed = useCallback(
    (action: ResourceAction, opts?: { resourceBranchId?: string | null }): boolean => {
      return AccessControlService.isAllowed(action, buildContext(opts));
    },
    [buildContext]
  );

  // Returns true only if ALL listed actions are permitted. 
  const isAllowedAll = useCallback(
    (actions: ResourceAction[]): boolean => {
      return AccessControlService.isAllowedAll(actions, buildContext());
    },
    [buildContext]
  );

  // Returns true if ANY listed action is permitted.
  const isAllowedAny = useCallback(
    (actions: ResourceAction[]): boolean => {
      return AccessControlService.isAllowedAny(actions, buildContext());
    },
    [buildContext]
  );

  // Filter a full navigation config for the current user + org. 
  const filterNavigation = useCallback(
    (groups: NavGroup[]): NavGroup[] => {
      return AccessControlService.filterNavigation(
        groups,
        {
          ...user, role: user.currentRole, branchId: user.branchId ?? null,
          avatar: null
        },
        organization
      );
    },
    [user, organization]
  );

  // Whether the org is currently active (not suspended/closed).
  const isOrgActive = organization ? AccessControlService.isOrganizationActive(organization) : true;

  // Whether the current user has a platform-level role. 
  const isPlatformUser = AccessControlService.isPlatformRole(user.currentRole);

  return {
    can,
    isAllowed,
    isAllowedAll,
    isAllowedAny,
    filterNavigation,
    isOrgActive,
    isPlatformUser,
    AccessControlService,
  };
}
