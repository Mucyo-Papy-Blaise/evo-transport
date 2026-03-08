import { UserRole } from '../types/enum';
import type { AuthUser } from '../types/auth';
import type { DashboardUser, DashboardOrganization } from '../types/navigations';

export class AuthService {
  /** Resolve role for dashboard: SUPER_ADMIN and MANAGING_DIRECTOR are special; others use API role string. */
  static resolveRole(user: AuthUser): string {
    if (user.role === UserRole.SUPER_ADMIN) return UserRole.SUPER_ADMIN;
    if (user.role === UserRole.MANAGING_DIRECTOR || user.role === 'Managing Director') return UserRole.MANAGING_DIRECTOR;
    return user.role ?? 'User';
  }

  static toDashboardUser(
    user: AuthUser,
    institutions: DashboardOrganization[] = [],
    branchId?: string | null,
  ): DashboardUser {
    const resolvedRole = AuthService.resolveRole(user);

    return {
      id:           user.id,
      name:         user.fullName || user.email.split('@')[0] || '',
      email:        user.email,
      avatar:       user.avatarUrl ?? null,
      role:         resolvedRole,
      currentRole:  resolvedRole,
      branchId:     branchId ?? user.branch?.id ?? null,
      institutions,
    };
  }
}