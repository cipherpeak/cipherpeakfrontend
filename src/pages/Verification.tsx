import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, FileCheck } from 'lucide-react';

const Verification = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Verification</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage content verification and client deliverables
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Verified</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">0</div>
                        <p className="text-xs text-green-700">This month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-800">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-900">0</div>
                        <p className="text-xs text-yellow-700">Awaiting review</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">0</div>
                        <p className="text-xs text-red-700">Needs revision</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Total</CardTitle>
                        <FileCheck className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900">0</div>
                        <p className="text-xs text-blue-700">All submissions</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Content Verification</CardTitle>
                    <CardDescription>
                        Review and verify client content submissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                        <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No verification data available</p>
                        <p className="text-sm">Content verification system is ready to use</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Verification;
