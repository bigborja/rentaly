-- Rentaly / Supabase project ipnqyejdfcwcltutrrvh. Run in the SQL editor.
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('experiencia', 'incidente', 'abuso');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('published', 'pending', 'removed');

-- CreateEnum
CREATE TYPE "AbuseCategory" AS ENUM ('fianza', 'honorarios', 'clausulas', 'acoso', 'entrada', 'suministros', 'obras', 'discriminacion', 'sin_contrato', 'precio', 'otro');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('baja', 'media', 'alta');

-- CreateEnum
CREATE TYPE "ConservationState" AS ENUM ('bueno', 'regular', 'deficiente', 'ruinoso');

-- CreateEnum
CREATE TYPE "LegalEntityKind" AS ENUM ('socimi', 'fondo', 'sa', 'sl', 'cooperativa', 'administracion', 'otra_juridica');

-- CreateEnum
CREATE TYPE "OwnershipSource" AS ENUM ('borm', 'registro_mercantil', 'nota_simple_redactada', 'user_verified');

-- CreateEnum
CREATE TYPE "EvidenceKind" AS ENUM ('nota_simple_redactada', 'borm', 'contrato_fragmento', 'foto', 'otro');

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "census_sections" (
    "code" TEXT NOT NULL,
    "municipalityCode" TEXT NOT NULL,
    "districtCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "census_sections_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "parcels" (
    "parcelRef" TEXT NOT NULL,
    "address" TEXT,
    "postalCode" TEXT,
    "barrioId" TEXT,
    "censusSectionCode" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "parcelAreaM2" DOUBLE PRECISION,
    "parcelKind" TEXT,
    "yearBuilt" INTEGER,
    "fetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parcels_pkey" PRIMARY KEY ("parcelRef")
);

-- CreateTable
CREATE TABLE "cadastral_units" (
    "ref" TEXT NOT NULL,
    "parcelRef" TEXT NOT NULL,
    "use" TEXT,
    "areaM2" DOUBLE PRECISION,
    "year" INTEGER,
    "participation" DOUBLE PRECISION,
    "stair" TEXT,
    "floor" TEXT,
    "door" TEXT,

    CONSTRAINT "cadastral_units_pkey" PRIMARY KEY ("ref")
);

-- CreateTable
CREATE TABLE "constructions" (
    "id" TEXT NOT NULL,
    "parcelRef" TEXT NOT NULL,
    "use" TEXT,
    "typology" TEXT,
    "floor" TEXT,
    "door" TEXT,
    "stair" TEXT,
    "areaM2" DOUBLE PRECISION,

    CONSTRAINT "constructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cadastral_snapshots" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "parcelRef" TEXT,
    "payload" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cadastral_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tourist_licenses" (
    "id" TEXT NOT NULL,
    "parcelRef" TEXT,
    "expedienteLu" TEXT,
    "decretoLu" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "address" TEXT,
    "floor" TEXT,
    "units" INTEGER NOT NULL DEFAULT 1,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'ayuntamiento_madrid_vut',

    CONSTRAINT "tourist_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building_inspections" (
    "id" TEXT NOT NULL,
    "parcelRef" TEXT,
    "address" TEXT,
    "kind" TEXT NOT NULL,
    "outcome" TEXT,
    "consultedAt" TIMESTAMP(3) NOT NULL,
    "consultUrl" TEXT NOT NULL,
    "publicRecord" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "building_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "works_licenses" (
    "id" TEXT NOT NULL,
    "parcelRef" TEXT,
    "expediente" TEXT,
    "address" TEXT,
    "description" TEXT,
    "year" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'ayuntamiento_madrid',

    CONSTRAINT "works_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "census_rent_stats" (
    "id" TEXT NOT NULL,
    "censusSectionCode" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "referenceRentEurosM2" DOUBLE PRECISION,
    "meanHouseholdIncomeEuros" DOUBLE PRECISION,
    "medianHouseholdIncomeEuros" DOUBLE PRECISION,
    "source" TEXT NOT NULL,

    CONSTRAINT "census_rent_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entities" (
    "id" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "kind" "LegalEntityKind" NOT NULL,

    CONSTRAINT "legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ownership_claims" (
    "id" TEXT NOT NULL,
    "parcelRef" TEXT NOT NULL,
    "unitRef" TEXT,
    "legalEntityId" TEXT NOT NULL,
    "source" "OwnershipSource" NOT NULL,
    "sourceUrl" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "confidence" TEXT NOT NULL,
    "largeHolderCandidate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ownership_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "intent" TEXT,
    "barrioId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "barrioId" TEXT,
    "cadastralRef" TEXT,
    "addressLabel" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "rentEuros" INTEGER,
    "rating" INTEGER,
    "abuseCategory" "AbuseCategory",
    "severity" "Severity",
    "conservationState" "ConservationState",
    "managerTaxId" TEXT,
    "managerLegalName" TEXT,
    "author" TEXT NOT NULL,
    "userId" TEXT,
    "recommend" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'published',

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_evidence" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "kind" "EvidenceKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "redacted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "neighborhoods_slug_key" ON "neighborhoods"("slug");

-- CreateIndex
CREATE INDEX "parcels_barrioId_idx" ON "parcels"("barrioId");

-- CreateIndex
CREATE INDEX "parcels_censusSectionCode_idx" ON "parcels"("censusSectionCode");

-- CreateIndex
CREATE INDEX "cadastral_units_parcelRef_idx" ON "cadastral_units"("parcelRef");

-- CreateIndex
CREATE INDEX "constructions_parcelRef_idx" ON "constructions"("parcelRef");

-- CreateIndex
CREATE UNIQUE INDEX "cadastral_snapshots_cacheKey_key" ON "cadastral_snapshots"("cacheKey");

-- CreateIndex
CREATE INDEX "cadastral_snapshots_expiresAt_idx" ON "cadastral_snapshots"("expiresAt");

-- CreateIndex
CREATE INDEX "tourist_licenses_parcelRef_idx" ON "tourist_licenses"("parcelRef");

-- CreateIndex
CREATE INDEX "tourist_licenses_address_idx" ON "tourist_licenses"("address");

-- CreateIndex
CREATE INDEX "building_inspections_parcelRef_idx" ON "building_inspections"("parcelRef");

-- CreateIndex
CREATE INDEX "works_licenses_parcelRef_idx" ON "works_licenses"("parcelRef");

-- CreateIndex
CREATE UNIQUE INDEX "census_rent_stats_censusSectionCode_year_source_key" ON "census_rent_stats"("censusSectionCode", "year", "source");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entities_taxId_key" ON "legal_entities"("taxId");

-- CreateIndex
CREATE INDEX "ownership_claims_parcelRef_idx" ON "ownership_claims"("parcelRef");

-- CreateIndex
CREATE INDEX "ownership_claims_legalEntityId_idx" ON "ownership_claims"("legalEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "reports_barrioId_idx" ON "reports"("barrioId");

-- CreateIndex
CREATE INDEX "reports_cadastralRef_idx" ON "reports"("cadastralRef");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "report_evidence_reportId_idx" ON "report_evidence"("reportId");

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "neighborhoods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_censusSectionCode_fkey" FOREIGN KEY ("censusSectionCode") REFERENCES "census_sections"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cadastral_units" ADD CONSTRAINT "cadastral_units_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constructions" ADD CONSTRAINT "constructions_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cadastral_snapshots" ADD CONSTRAINT "cadastral_snapshots_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tourist_licenses" ADD CONSTRAINT "tourist_licenses_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building_inspections" ADD CONSTRAINT "building_inspections_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works_licenses" ADD CONSTRAINT "works_licenses_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "census_rent_stats" ADD CONSTRAINT "census_rent_stats_censusSectionCode_fkey" FOREIGN KEY ("censusSectionCode") REFERENCES "census_sections"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_parcelRef_fkey" FOREIGN KEY ("parcelRef") REFERENCES "parcels"("parcelRef") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ownership_claims" ADD CONSTRAINT "ownership_claims_legalEntityId_fkey" FOREIGN KEY ("legalEntityId") REFERENCES "legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_barrioId_fkey" FOREIGN KEY ("barrioId") REFERENCES "neighborhoods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_evidence" ADD CONSTRAINT "report_evidence_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

