/**
 * Auth Controller
 * TODO: Implement API endpoints for auth management.
 */
import { Controller,Body,Post,Get,Request } from '@nestjs/common';
import { ApiTags,ApiOperation,ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new admin account' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.AuthService.register(dto);
    return { success: true, user, message: 'User registered successfully' };
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.AuthService.login(dto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.AuthService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  getMe(@Request() req: any) {
    return this.AuthService.getMe(req.user.id);
  }
}
