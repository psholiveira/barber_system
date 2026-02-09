import "./globals.css";
import Providers from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Rasoir Barbearia",
  icons: {
    icon: "/favicon.png",
  },
};

