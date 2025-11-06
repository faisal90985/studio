
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import type { ManagementPost } from '@/app/lib/types';

interface ManagementPostCardProps {
  post: ManagementPost;
  canManage: boolean;
  onEdit?: (post: ManagementPost) => void;
  onDelete?: (id: string) => void;
}

const ManagementPostCard = ({ post, canManage, onEdit, onDelete }: ManagementPostCardProps) => {
  const postDate = post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'recently';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <Badge className="mb-2 bg-accent text-accent-foreground hover:bg-accent/80">{post.type}</Badge>
                <CardTitle className="font-headline text-lg">{post.title}</CardTitle>
            </div>
            {canManage && onEdit && onDelete && (
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(post)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(post.id)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter>
        <CardDescription>Posted on: {postDate}</CardDescription>
      </CardFooter>
    </Card>
  );
};

export default ManagementPostCard;
