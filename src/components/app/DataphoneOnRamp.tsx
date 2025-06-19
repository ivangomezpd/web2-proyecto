import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const DataphoneOnRamp = () => {
  const [walletAddress, setWalletAddress] = useState("0x8e60...1234"); // reemplazar por wallet del comerciante
  const [amount, setAmount] = useState("25"); // EUR
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    const url = `https://onramp.depay.com/?to=${walletAddress}&amount=${amount}&currency=EUR&blockchain=ethereum`;
    setQrUrl(url);
  }, [walletAddress, amount]);

  return (
    <motion.div 
      className="flex items-center justify-center min-h-screen bg-gray-100"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8 }}
    >
      <Card className="w-full max-w-md shadow-2xl rounded-2xl p-6">
        <CardContent className="flex flex-col items-center space-y-6">
          <h2 className="text-xl font-semibold text-center">Pago Contactless con Cripto</h2>

          <p className="text-sm text-gray-600 text-center">
            Escanea este código QR para pagar {amount}€ con tarjeta, Apple Pay o Google Pay. 
            Recibirás USDT en la wallet del comerciante.
          </p>

          <div className="bg-white p-4 rounded-xl shadow-md">
            {qrUrl && (
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrUrl)}&size=200x200`} alt="QR Pago" />
            )}
          </div>

          <Button
            onClick={() => window.open(qrUrl, "_blank")}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Abrir pasarela en navegador
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataphoneOnRamp; 