import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Request,
    ForbiddenException,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.role.enum';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
    constructor(private readonly txnService: TransactionsService) { }

    // ────────────────────────────────────────────────
    //  GET /transactions/my  — Any authenticated user
    //  Returns paginated list of transactions they were part of
    // ────────────────────────────────────────────────
    @Get('my')
    async getMyTransactions(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const p = Math.max(1, parseInt(page || '1', 10));
        const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

        const result = await this.txnService.findByUser(req.user.userId, p, l);

        return {
            data: result.data.map((txn) => this.sanitizeTxn(txn, req.user.userId)),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }

    // ────────────────────────────────────────────────
    //  GET /transactions/:id  — Any authenticated user
    //  Can only view transactions they are part of (unless admin)
    // ────────────────────────────────────────────────
    @Get(':id')
    async getTransaction(@Param('id') id: string, @Request() req: any) {
        const txn = await this.txnService.findOne(id);

        const userId = req.user.userId;
        const role = req.user.role;

        // Admin can view any transaction
        if (role !== UserRole.ADMIN) {
            // Non-admin can only view transactions they were part of
            if (txn.from_user_id !== userId && txn.to_user_id !== userId) {
                throw new ForbiddenException('You can only view your own transactions');
            }
        }

        return this.sanitizeTxn(txn, userId);
    }

    // ────────────────────────────────────────────────
    //  GET /transactions  — Admin only
    //  Returns ALL transactions (paginated)
    // ────────────────────────────────────────────────
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    async getAllTransactions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const p = Math.max(1, parseInt(page || '1', 10));
        const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));

        return this.txnService.findAll(p, l);
    }

    // ────────────────────────────────────────────────
    //  Helper: Clean the transaction for response
    //  - Hides sensitive user fields (password_hash, etc.)
    //  - Shows "SUPPORT" label when admin is involved
    // ────────────────────────────────────────────────
    private sanitizeTxn(txn: any, viewerUserId: string) {
        return {
            id: txn.id,
            short_id: txn.short_id,
            type: txn.type,
            source: txn.source,
            amount: Number(txn.amount),
            description: txn.description,
            reference_id: txn.reference_id,
            from: txn.from_user
                ? {
                    id: txn.from_user.id,
                    name: txn.from_user.name,
                    username: txn.from_user.username,
                    role: txn.from_user.role,
                }
                : txn.source === 'SUPPORT'
                    ? { label: 'SUPPORT' }
                    : null,
            to: txn.to_user
                ? {
                    id: txn.to_user.id,
                    name: txn.to_user.name,
                    username: txn.to_user.username,
                    role: txn.to_user.role,
                }
                : txn.source === 'SUPPORT'
                    ? { label: 'SUPPORT' }
                    : null,
            created_at: txn.created_at,
        };
    }
}
