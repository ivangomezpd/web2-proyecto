"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCustomerOrders, getPaidOrders } from "@/lib/db/db";
import Orders from "@/components/app/Orders";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface Order {
	OrderID: number;
	OrderDate: string;
	TotalImporte: number;
}

export default function CustomerOrders() {
	const { customerId } = useParams();
	const [orders, setOrders] = useState<Order[]>([]);
	const [paidOrders, setPaidOrders] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchOrders() {
			try {
				const orderData = await getCustomerOrders(customerId as string);
				setOrders(orderData);

				// Obtener órdenes pagadas (solo si es admin o para todos)
				const paid = await getPaidOrders();
				setPaidOrders(paid);
			} catch (err) {
				setError("Failed to fetch customer orders");
				console.error(err);
			}
		}

		fetchOrders();
	}, [customerId]);

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}
	if (!orders) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<Orders orders={orders} customerId={customerId as string} />
			<div className="mt-10">
				<h2 className="text-xl font-bold mb-2">Órdenes con Pago Exitoso</h2>
				<table className="min-w-full border">
					<thead>
						<tr>
							<th className="border px-2 py-1">Order ID</th>
							<th className="border px-2 py-1">Customer</th>
							<th className="border px-2 py-1">Fecha de Pago</th>
							<th className="border px-2 py-1">Importe Pagado</th>
							<th className="border px-2 py-1">Código Autorización</th>
						</tr>
					</thead>
					<tbody>
						{paidOrders.map((order) => (
							<tr key={order.OrderID}>
								<td className="border px-2 py-1">
									<Link href={`/dashboard/${order.CustomerID}/orders/${order.OrderID}`} className="text-blue-600 hover:underline">
										{order.OrderID}
									</Link>
								</td>
								<td className="border px-2 py-1">{order.CustomerID}</td>
								<td className="border px-2 py-1">{new Date(order.PaymentDate).toLocaleString()}</td>
								<td className="border px-2 py-1">${order.PaidAmount?.toFixed(2)}</td>
								<td className="border px-2 py-1 font-bold">{order.authorizationCode}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

