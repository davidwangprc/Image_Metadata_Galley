"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderOpen, Search, ArrowDownWideNarrow, Folder, Trash2 } from 'lucide-react';
import { useFolderStore } from '@/hooks/use-folder-store';
import { readImageMetadata } from '@/lib/utils';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageGrid } from "./ImageGrid";
import { ImageMetadata } from "./ImageMetadata";

export default function ImageLibrary() {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(false);
  const { folders, addFolder, removeFolder, updateFolderHandle } = useFolderStore();

  const openFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const folder = {
        name: handle.name,
        path: handle.name,
        handle,
      };
      addFolder(folder);
      setCurrentFolder(folder.path);
      await handleFolderSelect(handle);
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  };

  const handleFolderSelect = async (handle: FileSystemDirectoryHandle) => {
    try {
      const images = [];
      for await (const entry of handle.values()) {
        if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.png')) {
          const metadata = await readImageMetadata(entry);
          const file = await entry.getFile();
          images.push({
            path: URL.createObjectURL(file),
            metadata,
            name: entry.name,
            lastModified: file.lastModified,
          });
        }
      }
      setImages(images);
    } catch (error) {
      console.error('Error reading folder:', error);
    }
  };

  const handleStoredFolderSelect = async (path: string) => {
    try {
      const folder = folders.find((f) => f.path === path);
      if (!folder) return;

      setCurrentFolder(path);
      let handle = folder.handle;

      if (!handle) {
        try {
          handle = await window.showDirectoryPicker({
            id: path,
            startIn: 'desktop',
          });
          updateFolderHandle(path, handle);
        } catch (error) {
          console.error('Error getting folder handle:', error);
          return;
        }
      }

      try {
        await handle.requestPermission({ mode: 'read' });
        await handleFolderSelect(handle);
      } catch (error) {
        console.error('Permission denied:', error);
        try {
          handle = await window.showDirectoryPicker({
            id: path,
            startIn: 'desktop',
          });
          updateFolderHandle(path, handle);
          await handleFolderSelect(handle);
        } catch (innerError) {
          console.error('Error selecting folder:', innerError);
        }
      }
    } catch (error) {
      console.error('Error accessing folder:', error);
    }
  };

  const handleFolderDelete = (path: string) => {
    if (currentFolder === path) {
      setImages([]);
      setCurrentFolder(null);
    }
    removeFolder(path);
  };

  const filteredAndSortedImages = images
    .filter((image) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        image.metadata?.toLowerCase().includes(query) ||
        image.name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const modifier = sortAscending ? 1 : -1;
      return (a.lastModified - b.lastModified) * modifier;
    });

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 flex flex-col">
        <Button 
          onClick={openFolder}
          className="w-full mb-4"
          variant="secondary"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          <span>打开文件夹</span>
        </Button>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {folders.map((folder) => (
              <div key={folder.path} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start",
                    currentFolder === folder.path && "bg-accent"
                  )}
                  onClick={() => handleStoredFolderSelect(folder.path)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  <span className="truncate">{folder.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleFolderDelete(folder.path)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <div className={cn(
        "flex-1 flex flex-col",
        selectedImage && "mr-96"
      )}>
        <div className="p-4 border-b bg-card">
          <div className="space-y-3 max-w-xl">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
              />
              <Input
                type="text"
                placeholder="搜索图片..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setSortAscending(!sortAscending)}
              >
                <ArrowDownWideNarrow className="h-4 w-4 mr-2" />
                {sortAscending ? '最早优先' : '最新优先'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ImageGrid
            images={filteredAndSortedImages}
            onImageSelect={setSelectedImage}
          />
        </div>
      </div>

      {selectedImage && (
        <aside className="fixed right-0 top-0 h-screen border-l bg-card">
          <ImageMetadata
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        </aside>
      )}
    </div>
  );
}