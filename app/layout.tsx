// app/layout.tsx
export const metadata = {
  title: {
    default: "LeGenerateurDigital",
    template: "%s | LeGenerateurDigital",
  },
  description: "Espace membres du Générateur Digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
