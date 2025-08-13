"use client"
import { fetchProductList } from '@/src/lib/request'
import React, { useEffect, useState } from 'react'
import { ProductTypes, SelectedProductTypes } from './types'
import { Button, Flex, Form, InputNumber, Modal, notification, Select, Table, TableColumnsType, Typography } from 'antd'
import { formatCurrency } from '@/src/utils/formats'

const OrderList = () => {
	const [api, contextHolder] = notification.useNotification()
	const [productList, setProductList] = useState([])
	const [rawProductData, setRawProductData] = useState([])
	const [orderList, setOrderList] = useState([])
	const [selectedProduct, setSelectedProduct] = useState<SelectedProductTypes | null>(null)
	const [isLoading, setIsLoading] = useState({
		list: false
	})
	const [isOpen, setIsOpen] = useState({
		add_orders: false
	})

	const [form_add] = Form.useForm()


	useEffect(() => {
		if (typeof window !== "undefined") {
			const SAVED_ORDERS = localStorage.getItem("data_orders");
			if (SAVED_ORDERS) {
				setOrderList(JSON.parse(SAVED_ORDERS));
			}
		}
	}, []);

	async function doQueryData() {
		try {
			setIsLoading((prev) => ({ ...prev, list: true }))
			const res = await fetchProductList()
			const data = res.data
			const formattedData: any = []
			for (const i in data) {
				formattedData.push({
					value: data[i].id,
					label: data[i].name,
				})
			}
			setProductList(formattedData)
			setRawProductData(data)
		} catch (error: any) {
			api.error({
				message: `Error: ${error.response.status}`,
				description: error?.response?.data?.message
			})
		} finally {
			setIsLoading((prev) => ({ ...prev, list: false }))
		}
	}

	async function handleOpenModal() {
		setIsOpen((prev) => ({ ...prev, add_orders: true }))
		await doQueryData()
	}

	function getSavedOrders() {
		try {
			const data = localStorage.getItem("data_orders");
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	async function handleAddOrders() {
		const FIELDS = await form_add.getFieldsValue();
		const TOTAL_PRICE = getUnitPrice() * (FIELDS.quantity || 0);
		const PAYLOAD = {
			id: FIELDS.product,
			name: selectedProduct?.name || "",
			quantity: FIELDS.quantity || 0,
			unit_price: getUnitPrice(),
			total_price: TOTAL_PRICE
		};
		const ordersArray = getSavedOrders();
		const existingIndex = ordersArray.findIndex((order: { id: string }) => order.id === PAYLOAD.id);
		if (existingIndex > -1) {
			ordersArray[existingIndex].quantity += PAYLOAD.quantity;
			ordersArray[existingIndex].total_price =
				ordersArray[existingIndex].unit_price * ordersArray[existingIndex].quantity;
		} else {
			ordersArray.push(PAYLOAD);
		}
		localStorage.setItem("data_orders", JSON.stringify(ordersArray));
		setOrderList(ordersArray);
		setIsOpen(prev => ({ ...prev, add_orders: false }));
		setSelectedProduct(null);
		form_add.resetFields();
	}


	function handleProductChange(value: string) {
		const selected = rawProductData.find(
			(product: SelectedProductTypes) => product.id === value
		) || null;
		setSelectedProduct(selected);

		form_add.setFieldsValue({ quantity: 1 });
	}

	function getMaxStock() {
		return selectedProduct?.stock ?? 0;
	}

	function getUnitPrice() {
		return selectedProduct?.price ?? 0;
	}

	function calculateTotal() {
		const quantity = form_add.getFieldValue('quantity') || 0
		return getUnitPrice() * quantity
	}

	const columns: TableColumnsType<ProductTypes> = [
		{
			title: "Product",
			dataIndex: "name",
			render: (data) => data || "-"
		},
		{
			title: "Quantity",
			dataIndex: "quantity",
			render: (data) => data || "-"
		},
		{
			title: "Harga Satuan",
			dataIndex: "unit_price",
			render: (data) => data ? formatCurrency(data) : "-"
		},
		{
			title: "Subtotal",
			dataIndex: "total_price",
			render: (data) => data ? formatCurrency(data) : "-"
		},
	];


	return (
		<>
			{contextHolder}
			<Flex justify='flex-end' style={{ marginBottom: 24 }}>
				<Button type='primary' onClick={handleOpenModal}>Add Orders</Button>
			</Flex>
			<Table rowKey="id" dataSource={orderList} columns={columns} />

			<Modal
				title="Add Orders - Merchant"
				loading={isLoading.list}
				centered
				open={isOpen.add_orders}
				onCancel={() => {
					setIsOpen((prev) => ({ ...prev, add_orders: false }))
					setSelectedProduct(null)
					form_add.resetFields()
				}}
				footer={
					<Flex gap="middle" justify='flex-end' style={{ marginTop: 46 }}>
						<Button onClick={() => {
							setIsOpen((prev) => ({ ...prev, add_orders: false }))
							setSelectedProduct(null)
							form_add.resetFields()
						}}>Batal</Button>
						<Button htmlType='submit' type='primary' onClick={() => form_add.submit()}>Simpan</Button>
					</Flex>
				}
			>
				<Form
					form={form_add}
					style={{ marginTop: 46 }}
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					onValuesChange={() => {
						setSelectedProduct(prev => prev ? { ...prev } : null);
					}}
					onFinish={handleAddOrders}
				>
					<Form.Item
						label="Nama Product"
						name="product"
						rules={[{ required: true, message: `Product is required` }]}
					>
						<Select
							options={productList}
							onChange={handleProductChange}
							placeholder="Select product"
						/>
					</Form.Item>

					<Form.Item
						label="Quantity"
						name="quantity"
						rules={[
							{ required: true, message: 'Quantity is required' },
							{
								validator: (_, value) => {
									if (value && value > getMaxStock()) {
										return Promise.reject(new Error(`Quantity tidak boleh lebih dari ${getMaxStock()}`))
									}
									return Promise.resolve()
								}
							}
						]}
					>
						<InputNumber
							min={1}
							max={getMaxStock()}
							disabled={!selectedProduct}
							inputMode='numeric'
							style={{ width: '100%' }}
							placeholder={selectedProduct ? `Max: ${getMaxStock()}` : 'Select product first'}
						/>
					</Form.Item>

					<Form.Item label="Harga Satuan" name="unit_price">
						<Typography.Text>
							{selectedProduct ? formatCurrency(getUnitPrice()) : '-'}
						</Typography.Text>
					</Form.Item>

					<Form.Item label="Harga Total" name="total_price">
						<Typography.Text>
							{selectedProduct ? formatCurrency(calculateTotal()) : '-'}
						</Typography.Text>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default OrderList