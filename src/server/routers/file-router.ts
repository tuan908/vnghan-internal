import { DEFAULT_MATERIAL_ID, DEFAULT_SIZE_ID, ErrorCodes } from "@/constants";
import json from "@/i18n/locales/vi.json";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { ImportResult, ScrewEntity } from "@/types";
import { eq, sql } from "drizzle-orm";
import { Row, Workbook } from "exceljs";
import { z } from "zod";
import SCHEMA from "../db";
import { j, publicProcedure } from "../jstack";
("@/server/db");

interface ExcelRow {
  id: string;
  [key: string]: any;
}

export const fileRouter = j.router({
  excel: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, c, input }) => {
      const { name } = input;
      const { db } = ctx;

      const file = new Workbook();

      return c.superjson(createSuccessResponse({ data: file }), 200);
    }),

  importExcel: publicProcedure.mutation(async ({ ctx, c }) => {
    const { db } = ctx;

    try {
      // Parse form data and validate file existence in one step
      const formData = await c.req.parseBody();
      const file = formData["file"] as File | undefined;

      if (!file || !/\.(xlsx|xls)$/i.test(file.name)) {
        return c.json(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            statusCode: 400,
            message: !file
              ? json.error.invalidFile
              : json.error.invalidFileExtension,
          }),
          400
        );
      }

      // Process Excel file
      const workbook = new Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());

      // Prepare data structures
      const rows: ScrewEntity[] = [];
      const errors: string[] = [];

      // Cache screw types to minimize DB queries
      const screwTypeCache = new Map();

      // Extract unique worksheet names
      const worksheetNames = workbook.worksheets.map((ws) => ws.name);

      // Batch fetch all needed screw types in a single query
      const screwTypes = await db
        .select({ name: SCHEMA.SCREW_TYPE.name, id: SCHEMA.SCREW_TYPE.id })
        .from(SCHEMA.SCREW_TYPE)
        .where(sql`${SCHEMA.SCREW_TYPE.name} in ${worksheetNames}`);

      // Populate cache for quick lookup
      screwTypes.forEach((type) => screwTypeCache.set(type.name, type.id));

      // Process each worksheet
      for (const worksheet of workbook.worksheets) {
        const typeId = screwTypeCache.get(worksheet.name);

        if (!typeId) {
          errors.push(`Unknown screw type: ${worksheet.name}`);
          continue;
        }

        // Get used range for efficiency
        const startRow = 8;
        const usedRowCount =
          worksheet.actualRowCount || worksheet.rowCount || 100;
        const endRow = Math.min(usedRowCount, 1000); // Safety limit

        // Process rows in batch
        const worksheetRows: ScrewEntity[] = [];

        for (let i = startRow; i <= endRow; i++) {
          const row = worksheet.getRow(i);

          // Fast path for empty rows
          if (row.cellCount === 0) continue;

          const name = getCellValue(row, 1);
          if (!name) continue;

          const quantity = getCellValue(row, 4);
          const price = getCellValue(row, 6);

          if (!quantity || !price) {
            errors.push(
              `Row ${i} in "${worksheet.name}": missing required data`
            );
            continue;
          }
          const materialName = getCellValue(row, 3)!;

          let id;

          if (!materialName) {
            id = DEFAULT_MATERIAL_ID;
          } else {
            const [material] = await db
              .select({ id: SCHEMA.SCREW_MATERIAL.id })
              .from(SCHEMA.SCREW_MATERIAL)
              .where(eq(SCHEMA.SCREW_MATERIAL.name, materialName))
              .limit(1);
            id = material?.id ?? DEFAULT_MATERIAL_ID;
          }

          let images = [];

          let url = getCellValue(row, 7);

          if (url) images.push({ id: i.toString(), url });

          worksheetRows.push({
            sizeId: DEFAULT_SIZE_ID,
            name,
            description: getCellValue(row, 2) || "",
            componentTypeId: typeId,
            materialId: id,
            quantity,
            price,
            note: getCellValue(row, 5) || "",
            id: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            isDeleted: false,
          });
        }

        rows.push(...worksheetRows);
      }

      // Handle empty result
      if (rows.length === 0) {
        return c.json(
          createErrorResponse({
            code: ErrorCodes.BAD_REQUEST,
            message:
              errors.length > 0
                ? `Import failed: ${errors.slice(0, 5).join("; ")}${
                    errors.length > 5 ? "..." : ""
                  }`
                : json.error.noValidRows,
          }),
          400
        );
      }

      // Batch insert all data
      const result = await db.insert(SCHEMA.SCREW).values(rows).returning();

      return c.json(
        createSuccessResponse<ImportResult>({
          rowsCount: result.length || rows.length,
        }),
        200
      );
    } catch (error: any) {
      console.error("Excel import error:", error);
      return c.json(
        createErrorResponse({
          code: ErrorCodes.INTERNAL_SERVER_ERROR,
          statusCode: 500,
          message: `Import error: ${
            error.message?.substring(0, 200) || "Unknown error"
          }`,
        }),
        500
      );
    }
  }),
});

function getCellValue(row: Row, cellIndex: number): string | undefined {
  const cell = row.getCell(cellIndex);
  const value = cell.value;

  if (value === null || value === undefined) return undefined;

  if (cell.isHyperlink) return cell.hyperlink;

  return value.toString().trim();
}
