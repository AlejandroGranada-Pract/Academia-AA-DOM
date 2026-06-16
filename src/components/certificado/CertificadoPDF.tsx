import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// Paleta de marca
const AZUL = "#76B8E0";
const DORADO = "#BE9B60";
const GRAFITO = "#1F1F1F";
const TEXTO = "#353535";
const CREMA = "#F8F7F4";

const styles = StyleSheet.create({
  page: {
    backgroundColor: CREMA,
    paddingVertical: 36,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
  },
  frame: {
    flex: 1,
    borderWidth: 2,
    borderColor: DORADO,
    borderStyle: "solid",
    paddingVertical: 38,
    paddingHorizontal: 54,
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Encabezado de marca
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandAzul: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    letterSpacing: 3,
    color: AZUL,
  },
  brandSep: { width: 1, height: 18, backgroundColor: "#0000003a" },
  brandDom: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    letterSpacing: 5,
    color: DORADO,
  },
  kicker: {
    marginTop: 6,
    fontSize: 8,
    letterSpacing: 4,
    color: TEXTO,
    opacity: 0.6,
  },
  // Divisor azul + dorado
  divider: { flexDirection: "row", marginTop: 14, marginBottom: 6 },
  divAzul: { width: 46, height: 3, backgroundColor: AZUL, borderRadius: 2 },
  divDorado: { width: 24, height: 3, backgroundColor: DORADO, borderRadius: 2 },
  // Cuerpo
  titulo: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    letterSpacing: 2,
    color: GRAFITO,
    textAlign: "center",
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: TEXTO,
    opacity: 0.7,
    textTransform: "uppercase",
  },
  nombre: {
    fontFamily: "Helvetica-Bold",
    fontSize: 32,
    color: GRAFITO,
    textAlign: "center",
  },
  nombreLinea: {
    marginTop: 6,
    width: 360,
    height: 1,
    backgroundColor: "#00000022",
  },
  curso: {
    fontFamily: "Helvetica-Bold",
    fontSize: 17,
    color: DORADO,
    textAlign: "center",
    maxWidth: 560,
  },
  empresa: {
    marginTop: 4,
    fontSize: 10,
    letterSpacing: 1,
    color: TEXTO,
    opacity: 0.7,
  },
  // Pie
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
  },
  footItem: { alignItems: "center", width: 190 },
  footLinea: { width: 150, height: 1, backgroundColor: "#00000033", marginBottom: 4 },
  footLabel: { fontSize: 8, letterSpacing: 1, color: TEXTO, opacity: 0.6 },
  footValor: { fontSize: 10, color: GRAFITO, fontFamily: "Helvetica-Bold" },
  codigo: { fontSize: 8, color: TEXTO, opacity: 0.7 },
  // QR central
  qrCol: { alignItems: "center", width: 120 },
  qr: { width: 58, height: 58 },
  qrLabel: { marginTop: 3, fontSize: 6, letterSpacing: 1, color: TEXTO, opacity: 0.6 },
});

export type CertificadoData = {
  nombre: string;
  curso: string;
  empresa: string; // etiqueta legible
  fecha: string; // ya formateada
  codigo: string;
  qrDataUrl?: string; // PNG data URL del QR de verificación
};

export function CertificadoDoc({
  nombre,
  curso,
  empresa,
  fecha,
  codigo,
  qrDataUrl,
}: CertificadoData) {
  return (
    <Document
      title={`Certificado — ${curso}`}
      author="Academia AA | DOM"
      subject={`Certificado de finalización de ${nombre}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          {/* Encabezado */}
          <View style={{ alignItems: "center" }}>
            <View style={styles.brandRow}>
              <Text style={styles.brandAzul}>AMBIENTE AZUL</Text>
              <View style={styles.brandSep} />
              <Text style={styles.brandDom}>DOM</Text>
            </View>
            <Text style={styles.kicker}>ACADEMIA DE FORMACIÓN</Text>
          </View>

          {/* Cuerpo */}
          <View style={{ alignItems: "center" }}>
            <Text style={styles.titulo}>CERTIFICADO DE FINALIZACIÓN</Text>
            <View style={styles.divider}>
              <View style={styles.divAzul} />
              <View style={styles.divDorado} />
            </View>

            <Text style={[styles.label, { marginTop: 18 }]}>
              Se otorga el presente certificado a
            </Text>
            <Text style={[styles.nombre, { marginTop: 10 }]}>{nombre}</Text>
            <View style={styles.nombreLinea} />

            <Text style={[styles.label, { marginTop: 18 }]}>
              por completar satisfactoriamente el curso
            </Text>
            <Text style={[styles.curso, { marginTop: 8 }]}>{curso}</Text>
            <Text style={styles.empresa}>{empresa}</Text>
          </View>

          {/* Pie */}
          <View style={styles.footer}>
            <View style={styles.footItem}>
              <View style={styles.footLinea} />
              <Text style={styles.footLabel}>FECHA DE EMISIÓN</Text>
              <Text style={styles.footValor}>{fecha}</Text>
            </View>

            {qrDataUrl ? (
              <View style={styles.qrCol}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={qrDataUrl} style={styles.qr} />
                <Text style={styles.qrLabel}>ESCANEA PARA VERIFICAR</Text>
              </View>
            ) : null}

            <View style={styles.footItem}>
              <View style={styles.footLinea} />
              <Text style={styles.footLabel}>ACADEMIA AA | DOM</Text>
              <Text style={styles.codigo}>{codigo}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
