-- CreateTable
CREATE TABLE "Grupo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grupo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserGrupos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserGrupos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CourseGrupos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseGrupos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grupo_name_key" ON "Grupo"("name");

-- CreateIndex
CREATE INDEX "_UserGrupos_B_index" ON "_UserGrupos"("B");

-- CreateIndex
CREATE INDEX "_CourseGrupos_B_index" ON "_CourseGrupos"("B");

-- AddForeignKey
ALTER TABLE "_UserGrupos" ADD CONSTRAINT "_UserGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserGrupos" ADD CONSTRAINT "_UserGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseGrupos" ADD CONSTRAINT "_CourseGrupos_A_fkey" FOREIGN KEY ("A") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CourseGrupos" ADD CONSTRAINT "_CourseGrupos_B_fkey" FOREIGN KEY ("B") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
