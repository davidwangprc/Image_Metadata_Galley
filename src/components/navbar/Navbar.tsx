"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Button, Text, Group } from '@mantine/core';
import '@mantine/core/styles.css';
import { 
  IconChevronDown, 
  IconPhoto, 
  IconBrush, 
  IconWand, 
  IconSettings, 
  IconLayoutGrid,
  IconHome2
} from '@tabler/icons-react';
import styles from './navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Group gap="xl">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            leftSection={<IconHome2 size={16} />}
            className={`${styles.homeButton} ${styles.button}`}
          >
            首页
          </Button>

          <Group gap="md">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  rightSection={<IconChevronDown size={14} />}
                  leftSection={<IconPhoto size={16} />}
                  className={styles.button}
                >
                  图片
                </Button>
              </Menu.Target>

              <Menu.Dropdown className={styles.dropdown}>
                <Menu.Item 
                  component={Link} 
                  href="/categories/portrait"
                  className={`${styles.menuItem} ${styles.menuItemHover}`}
                >
                  人物肖像
                </Menu.Item>
                <Menu.Item component={Link} href="/categories/landscape">
                  风景
                </Menu.Item>
                <Menu.Item component={Link} href="/categories/anime">
                  动漫
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} href="/categories">
                  浏览全部
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200} position="bottom-start">
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  rightSection={<IconChevronDown size={14} />}
                  leftSection={<IconBrush size={16} />}
                  className={styles.button}
                >
                  模型
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item component={Link} href="/models?type=Checkpoint">
                  基础模型
                </Menu.Item>
                <Menu.Item component={Link} href="/models?type=LoRA">
                  LoRA
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} href="/models">
                  浏览全部
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200} position="bottom-start">
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  rightSection={<IconChevronDown size={14} />}
                  leftSection={<IconLayoutGrid size={16} />}
                  className={styles.button}
                >
                  工作流
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item component={Link} href="/workflows?type=portrait">
                  人像工作流
                </Menu.Item>
                <Menu.Item component={Link} href="/workflows?type=landscape">
                  风景工作流
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} href="/workflows">
                  浏览全部
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu shadow="md" width={200} position="bottom-start">
              <Menu.Target>
                <Button 
                  variant="subtle" 
                  rightSection={<IconChevronDown size={14} />}
                  leftSection={<IconWand size={16} />}
                  className={styles.button}
                >
                  词库
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item component={Link} href="/wildcards?type=Style">
                  风格词库
                </Menu.Item>
                <Menu.Item component={Link} href="/wildcards?type=Technical">
                  技术词库
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item component={Link} href="/wildcards">
                  浏览全部
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Group>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button 
                variant="subtle" 
                rightSection={<IconChevronDown size={14} />}
                leftSection={<IconSettings size={16} />}
                className={styles.button}
              >
                更多
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item component={Link} href="/meta">
                元数据管理
              </Menu.Item>
              <Menu.Item component={Link} href="/admin/settings">
                系统设置
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </div>
    </nav>
  );
}
