# Feature: Setup Tailwind CSS and design tokens

**Task ID**: 2
**Status**: In Progress
**Branch**: feat/task-2-tailwind-setup

## Overview
配置 Tailwind CSS 3.x 框架，包含自定义设计令牌、色彩体系、间距系统和排版规范。通过 tailwind.config.js 扩展主题，为后续 UI 组件开发提供一致的设计基础。

## Rationale
Task #1 已完成 Vite + React + TypeScript 项目初始化。Tailwind CSS 是项目技术栈中的关键 UI 框架，需要：
- 提供原子级 CSS 类，加速开发
- 建立统一的设计令牌体系
- 支持深色模式主题切换
- 优化生产环境构建（PurgeCSS）

## Impact Assessment
- **User Stories Affected**: 所有 UI 相关功能都需要统一的设计体系
- **Architecture Changes**: 是的，在技术栈中添加 Tailwind CSS 配置
- **Breaking Changes**: 否，这是基础架构搭建阶段

## Requirements Trace
- Traces to: specs/architecture.md#technology-stack (Tailwind CSS 3.x 配置)

## Design Decisions
1. **色彩体系**: 采用现代金融级配色（主色: indigo，辅助色: gray）
2. **间距系统**: 基于 4px 的倍数系统（4, 8, 12, 16, 20, 24...）
3. **排版**: 使用 Inter 字体，支持多语言
4. **响应式**: 移动优先的断点设计（sm, md, lg, xl, 2xl）
5. **深色模式**: 类名切换方式（dark: 前缀）