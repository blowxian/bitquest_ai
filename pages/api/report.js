// pages/api/reports.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    switch (req.method) {
        case 'POST':
            // 创建一个新的报告
            return createReport(req, res);
        case 'GET':
            // 获取报告，可以是单个或多个
            return getReports(req, res);
        case 'PUT':
            // 更新一个已存在的报告
            return updateReport(req, res);
        default:
            // 不支持其他方法
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function createReport(req, res) {
    try {
        const { userId, title, content } = req.body;
        const report = await prisma.report.create({
            data: {
                userId, // 可以为 null 如果匿名
                title,
                content,
            },
        });
        return res.status(200).json({ url: `/reports/${report.id}`, reportId: report.id });
    } catch (error) {
        console.error('Request error', error);
        res.status(500).json({ error: 'Error creating report' });
    }
}

async function getReports(req, res) {
    try {
        const { id } = req.query;
        if (id) {
            // 获取单个报告
            const report = await prisma.report.findUnique({
                where: { id: parseInt(id) },
            });
            if (report) {
                return res.status(200).json(report);
            }
            return res.status(404).json({ error: 'Report not found' });
        } else {
            // 获取所有报告
            const reports = await prisma.report.findMany();
            return res.status(200).json(reports);
        }
    } catch (error) {
        console.error('Request error', error);
        res.status(500).json({ error: 'Error fetching reports' });
    }
}

async function updateReport(req, res) {
    try {
        const { id, userId, title, content } = req.body;
        const report = await prisma.report.update({
            where: { id: parseInt(id) },
            data: {
                userId,
                title,
                content,
            },
        });
        return res.status(200).json(report);
    } catch (error) {
        console.error('Request error', error);
        res.status(500).json({ error: 'Error updating report' });
    }
}