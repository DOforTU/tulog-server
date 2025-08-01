import { SetMetadata } from '@nestjs/common';

/**
 * 데코레이터: 비활성화된 사용자도 접근 허용
 * @AllowInactiveUser()를 사용하면 isActive가 false여도 접근 가능
 */
export const AllowInactiveUser = () => SetMetadata('allowInactiveUser', true);
