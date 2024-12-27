"use client";

import { useState, useEffect } from "react";
import { Select, TextInput, ActionIcon } from "@mantine/core";
import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import styles from "./search.module.css";

interface SearchProps {
  placeholder?: string;
}

export function Search({ placeholder = "Search styles..." }: SearchProps) {
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    // 获取文件夹列表
    const loadFolders = async () => {
      try {
        const response = await fetch('/api/folders');
        const folderList = await response.json();
        setFolders(folderList);
        if (folderList.length > 0) {
          setSelectedFolder(folderList[0]);
        }
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
    };

    loadFolders();
  }, []);

  return (
    <div className={styles.searchRoot}>
      <div className={styles.searchWrapper}>
        <div className={styles.dropdownWrapper}>
          <Select
            value={selectedFolder}
            onChange={(value) => setSelectedFolder(value || folders[0])}
            data={folders}
            rightSection={
              <IconChevronDown 
                size={16} 
                style={{ 
                  opacity: 0.9, 
                  color: "var(--text-color)"
                }} 
              />
            }
            allowDeselect={false}
            searchable={false}
            withCheckIcon={false}
            comboboxProps={{ 
              withinPortal: false,
              transitionProps: { transition: 'pop', duration: 200 }
            }}
          />
        </div>
        <div className={styles.inputWrapper}>
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            type="search"
            autoComplete="off"
          />
          <ActionIcon 
            className={styles.searchButton}
            variant="transparent"
            size="lg"
            aria-label="Search"
          >
            <IconSearch size={18} />
          </ActionIcon>
        </div>
      </div>
    </div>
  );
}
