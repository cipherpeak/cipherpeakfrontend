
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Video, Image as ImageIcon, IndianRupee, Calendar, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportDetailedReportToPDF } from '@/lib/pdfExport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock Data
const clientDetails = {
  1: { name: 'Acme Corp', status: 'Active', paymentStatus: 'Paid', month: 'January 2026' },
  2: { name: 'Globex Inc', status: 'Active', paymentStatus: 'Pending', month: 'January 2026' },
};

const contentLog = [
  { id: 1, type: 'Video', title: 'Product Launch Reel', postedDate: '2026-01-12', takenDate: '2026-01-10', employee: 'Alice Wonderland', postedBy: 'Charlie Brown' },
  { id: 2, type: 'Poster', title: 'New Year Offer', postedDate: '2026-01-05', takenDate: '2026-01-03', employee: 'Bob Builder', postedBy: 'Eve Hacker' },
  { id: 3, type: 'Video', title: 'Customer Testimonial', postedDate: '2026-01-18', takenDate: '2026-01-15', employee: 'Alice Wonderland', postedBy: 'Mallory Malice' },
  { id: 4, type: 'Poster', title: 'Weekend Sale', postedDate: '2026-01-20', takenDate: '2026-01-18', employee: 'Charlie Brown', postedBy: 'Alice Wonderland' },
];

const adsData = [
  { id: 1, campaign: 'New Year Promo', platform: 'Instagram', spend: 5000, status: 'Active' },
  { id: 2, campaign: 'Brand Awareness', platform: 'Facebook', spend: 3500, status: 'Completed' },
  { id: 3, campaign: 'Lead Gen', platform: 'LinkedIn', spend: 8000, status: 'Active' },
];

const chartData = [
  { name: 'Week 1', videos: 1, posters: 1, spend: 2000 },
  { name: 'Week 2', videos: 2, posters: 0, spend: 3000 },
  { name: 'Week 3', videos: 0, posters: 2, spend: 1500 },
  { name: 'Week 4', videos: 1, posters: 1, spend: 4000 },
];

const ClientReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedMonth = location.state?.month || 'January 2026';

  // Safe cast for demo purposes
  const clientId = Number(id) as keyof typeof clientDetails;
  const client = { ...clientDetails[clientId] || clientDetails[1], month: selectedMonth }; // Override month with selected one

  const totalVideos = contentLog.filter(c => c.type === 'Video').length;
  const totalPosters = contentLog.filter(c => c.type === 'Poster').length;
  const totalSpend = adsData.reduce((acc, curr) => acc + curr.spend, 0);

  const handlePDFExport = () => {
    exportDetailedReportToPDF(
      [
        {
          title: 'Content Production Log',
          data: contentLog,
          columns: ['title', 'type', 'takenDate', 'postedDate', 'employee', 'postedBy']
        },
        {
          title: 'Ads Performance',
          data: adsData,
          columns: ['campaign', 'platform', 'status', 'spend']
        }
      ],
      {
        filename: `${client.name}_Monthly_Report_${client.month}`,
        mainTitle: `${client.name} - Monthly Report`,
        subtitle: client.month,
        orientation: 'portrait'
      }
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{client.name} - Monthly Report</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {client.month}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => {
              const worksheet = XLSX.utils.json_to_sheet(contentLog);
              const workbook = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
              XLSX.writeFile(workbook, `${client.name}_Content_Log_${new Date().toISOString().split('T')[0]}.xlsx`);
            }}
            className="gap-2 rounded-r-none border-r border-primary/20"
            variant="default"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button onClick={handlePDFExport} className="gap-2 rounded-l-none" variant="default">
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Badge variant={client.paymentStatus === 'Paid' ? 'default' : 'destructive'} className="text-lg px-4 py-1">
            {client.paymentStatus}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Posters</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpend.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content Log</TabsTrigger>
          <TabsTrigger value="ads">Ads Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Content Production Log</CardTitle>
                <CardDescription>Details of videos and posters created this month.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Taken Date (Shoot/Design)</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Posted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contentLog.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.takenDate}</TableCell>
                      <TableCell>{item.postedDate}</TableCell>
                      <TableCell>{item.employee}</TableCell>
                      <TableCell>{item.postedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ads Performance</CardTitle>
              <CardDescription>Breakdown of ad campaigns and spending.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adsData.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.campaign}</TableCell>
                      <TableCell>{ad.platform}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ad.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{ad.spend.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Production & Spend</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="videos" fill="#8884d8" name="Videos" />
                  <Bar yAxisId="left" dataKey="posters" fill="#82ca9d" name="Posters" />
                  <Bar yAxisId="right" dataKey="spend" fill="#ffc658" name="Ad Spend (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientReportDetail;
