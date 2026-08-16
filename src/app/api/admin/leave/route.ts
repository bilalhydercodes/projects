import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { LeaveStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use a safe session check that doesn't perform redirects during build-time.
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Roles allowed to access this route
    const allowedRoles = ["admin", "SCHOOL_ADMIN", "SUPER_ADMIN", "provider"];
    if (!allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine active school context
    let schoolId = session.schoolId ?? null;

    if ((session.role === "SUPER_ADMIN" || session.role === "provider") && !schoolId) {
      const { searchParams: sp } = new URL(request.url);
      schoolId = sp.get("schoolId") ?? null;
    }

    if (!schoolId) {
      return NextResponse.json({ error: "School context required" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") as LeaveStatus) ?? null;
    const type = searchParams.get("type");

    const studentLeaveRequests: Awaited<ReturnType<typeof prisma.leaveRequest.findMany>> = [];
    const teacherLeaveRequests: Awaited<ReturnType<typeof prisma.leaveRequest.findMany>> = [];

    // Fetch student leave requests
    if (!type || type === "ALL" || type === "STUDENT") {
      const rows = await prisma.leaveRequest.findMany({
        where: {
          schoolId,
          studentId: { not: null },
          ...(status ? { status } : {}),
        },
        include: {
          student: { include: { class: true, grade: true } },
        },
        orderBy: { appliedAt: "desc" },
      });
      studentLeaveRequests.push(...rows);
    }

    // Fetch teacher leave requests
    if (!type || type === "ALL" || type === "TEACHER") {
      const rows = await prisma.leaveRequest.findMany({
        where: {
          schoolId,
          teacherId: { not: null },
          ...(status ? { status } : {}),
        },
        include: { teacher: true },
        orderBy: { appliedAt: "desc" },
      });
      teacherLeaveRequests.push(...rows);
    }

    // Combine and return all requests
    const allRequests = [
      ...studentLeaveRequests.map((req) => ({ ...req, type: "STUDENT" })),
      ...teacherLeaveRequests.map((req) => ({ ...req, type: "TEACHER" })),
    ].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());

    return NextResponse.json(allRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json({ error: "Failed to fetch leave requests" }, { status: 500 });
  }
}
