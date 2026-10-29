import { asyncRouter } from "../../security/router";
import type { Request, Response } from "express";
import express from "express";
import { prisma } from "../../database/prisma";

const router = asyncRouter();

function getDateRange(period: string, date?: string, year?: string, month?: string) {
  if (period === "monthly" && year && month) {
    const y = Number(year);
    const m = Number(month);
    return { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0, 23, 59, 59, 999) };
  }
  const d = date ? new Date(date) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

function proveniencia(customer: any): string {
  if (customer?.protocolId)                          return "protocolo";
  if (customer?.partnerId)                           return "parceria";
  if (customer?.customersInsurance?.length > 0)      return "seguro";
  return "particular";
}

// ── Recepção ─────────────────────────────────────────────────────
router.get("/recepcao", async (req: Request, res: Response) => {
  try {
    const { period = "daily", date, year, month } = req.query as Record<string, string>;
    const dateRange = getDateRange(period, date, year, month);

    const items = await prisma.attendance.findMany({
      where: { createdAt: dateRange, deletedAt: null },
      include: {
        customer: {
          select: {
            id: true, name: true, nif: true,
            protocolId: true, partnerId: true,
            customersInsurance: { select: { id: true } },
          },
        },
        receptionist: { select: { id: true, name: true } },
        service:      { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byStatus: Record<string, number> = {};
    const byProveniencia = { particular: 0, seguro: 0, protocolo: 0, parceria: 0 };

    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      const prov = proveniencia(item.customer) as keyof typeof byProveniencia;
      byProveniencia[prov]++;
    }

    res.json({ success: true, data: { total: items.length, byStatus, byProveniencia, items } });
  } catch {
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ── Consultório ──────────────────────────────────────────────────
router.get("/consultorio", async (req: Request, res: Response) => {
  try {
    const { period = "daily", date, year, month } = req.query as Record<string, string>;
    const dateRange = getDateRange(period, date, year, month);

    const items = await prisma.consultation.findMany({
      where: { createdAt: dateRange, deletedAt: null },
      include: {
        doctor:    { select: { id: true, name: true } },
        screening: { include: { customer: { select: { id: true, name: true, nif: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byDoctor: Record<string, number> = {};
    for (const item of items) {
      const name = item.doctor?.name ?? "Sem médico";
      byDoctor[name] = (byDoctor[name] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        total: items.length,
        withScreening: items.filter((i) => i.screening).length,
        byDoctor: Object.entries(byDoctor).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        items,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ── Laboratório ──────────────────────────────────────────────────
router.get("/laboratorio", async (req: Request, res: Response) => {
  try {
    const { period = "daily", date, year, month } = req.query as Record<string, string>;
    const dateRange = getDateRange(period, date, year, month);

    const items = await prisma.requestExams.findMany({
      where: { createdAt: dateRange, deletedAt: null },
      include: {
        exam:     { select: { id: true, name: true } },
        customer: { select: { id: true, name: true, nif: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const byExam: Record<string, number> = {};
    for (const item of items) {
      const name = (item.exam as any)?.name ?? "Desconhecido";
      byExam[name] = (byExam[name] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        total: items.length,
        pending: items.filter((i) => !i.result).length,
        done:    items.filter((i) => !!i.result).length,
        byExam:  Object.entries(byExam).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        items,
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ── Enfermaria ───────────────────────────────────────────────────
router.get("/enfermaria", async (req: Request, res: Response) => {
  try {
    const { period = "daily", date, year, month } = req.query as Record<string, string>;
    const dateRange = getDateRange(period, date, year, month);

    const [observations, administrations] = await Promise.all([
      prisma.observation.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: { service: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.administrationMedicament.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: {
          customer: { select: { id: true, name: true, nif: true } },
          service:  { select: { id: true, name: true } },
          nurse:    { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const obsByStatus: Record<string, number> = {};
    for (const o of observations)    obsByStatus[o.status] = (obsByStatus[o.status] || 0) + 1;
    const admByStatus: Record<string, number> = {};
    for (const a of administrations) admByStatus[a.status] = (admByStatus[a.status] || 0) + 1;

    res.json({
      success: true,
      data: {
        observations:   { total: observations.length,    byStatus: obsByStatus, items: observations },
        administrations:{ total: administrations.length, byStatus: admByStatus, items: administrations },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

// ── Relatório Geral (médico / admin) ─────────────────────────────
router.get("/general", async (req: Request, res: Response) => {
  try {
    const { period = "daily", date, year, month } = req.query as Record<string, string>;
    const dateRange = getDateRange(period, date, year, month);

    const [
      attendances,
      consultations,
      observations,
      administrations,
      ambulatories,
      internments,
      surgeries,
      prescriptions,
      exams,
      imagiologies,
    ] = await Promise.all([
      prisma.attendance.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: {
          customer: {
            select: {
              id: true, name: true, nif: true,
              protocolId: true, partnerId: true,
              customersInsurance: { select: { id: true } },
            },
          },
        },
      }),
      prisma.consultation.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: { doctor: { select: { id: true, name: true } } },
      }),
      prisma.observation.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
      prisma.administrationMedicament.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
      prisma.ambulatory.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
      prisma.internment.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
      prisma.surgery.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
      prisma.prescription.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: { items: { select: { id: true } } },
      }),
      prisma.requestExams.findMany({
        where: { createdAt: dateRange, deletedAt: null },
        include: { exam: { select: { name: true } } },
      }),
      prisma.imagiologyRequestForm.findMany({
        where: { createdAt: dateRange, deletedAt: null },
      }),
    ]);

    // Proveniência
    const byProveniencia = { particular: 0, seguro: 0, protocolo: 0, parceria: 0 };
    for (const a of attendances) {
      const prov = proveniencia(a.customer) as keyof typeof byProveniencia;
      byProveniencia[prov]++;
    }

    // Exames por nome (laboratório)
    const byExam: Record<string, number> = {};
    for (const e of exams) {
      const name = (e.exam as any)?.name ?? "Desconhecido";
      byExam[name] = (byExam[name] || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        recepcao:       { total: attendances.length, byProveniencia },
        consultas:      { total: consultations.length },
        enfermaria:     { administrations: administrations.length, observations: observations.length },
        ambulatorio:    { total: ambulatories.length },
        observacao:     { total: observations.length },
        internamento:   { total: internments.length },
        farmacia:       {
          total:         prescriptions.length,
          entregues:     prescriptions.filter((p) => p.paid).length,
          naoEntregues:  prescriptions.filter((p) => !p.paid).length,
        },
        laboratorio:    {
          total:   exams.length,
          done:    exams.filter((e) => !!e.result).length,
          pending: exams.filter((e) => !e.result).length,
          byExam:  Object.entries(byExam).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        },
        imagiologia:    { total: imagiologies.length },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erro interno" });
  }
});

export default router;
