"use client"
import { fetchProductList } from '@/src/lib/request'
import React, { useState } from 'react'
import { ProductTypes } from './types'
import { Button, Flex, Form, InputNumber, Modal, Select, Table, TableColumnsType, Typography } from 'antd'
import { formatCurrency } from '@/src/utils/formats'

const OrderList = () => {
	const [productList, setProductList] = useState([])
	const [rawProductData, setRawProductData] = useState([])
	const [orderList, setOrderList] = useState([])
	const [selectedProduct, setSelectedProduct] = useState(null)
	const [isLoading, setIsLoading] = useState({
		list: false
	})
	const [isOpen, setIsOpen] = useState({
		add_orders: false
	})

	const [form_add] = Form.useForm()

	async function doQueryData() {
		try {
			setIsLoading((prev) => ({ ...prev, list: true }))
			const res = await fetchProductList()
			const data = res.data
			const formattedData: any = []
			
			console.log({data})
			for (const i in data) {
				formattedData.push({
					value: data[i].id,
					label: data[i].name,
				})
			}
			console.log({ formattedData })
			setProductList(formattedData)
			setRawProductData(data)
		} catch (error) {
			console.log(error)
		} finally {
			setIsLoading((prev) => ({ ...prev, list: false }))
		}
	}

	async function handleOpenModal() {
		setIsOpen((prev) => ({ ...prev, add_orders: true }))
		await doQueryData()
	}

	function handleAddOrders() {
		console.log("Adding Orders")
	}

	function handleProductChange(value: string) {
		const selected = rawProductData.find((product: any) => product.id === value)
		setSelectedProduct(selected)
		
		form_add.setFieldsValue({ quantity: 1 })
	}

	function getMaxStock() {
		return selectedProduct ? selectedProduct.stock : 0
	}

	function getUnitPrice() {
		return selectedProduct ? selectedProduct.price : 0
	}

	function calculateTotal() {
		const quantity = form_add.getFieldValue('quantity') || 0
		return getUnitPrice() * quantity
	}

	const columns: TableColumnsType<ProductTypes> = [
		{
			title: "Product",
			dataIndex: "name",
			render: (data: string) => {
				return data ? data : "-";
			},
		},
		{
			title: "Quantity",
			dataIndex: "",
			render: (data: string) => {
				return data ? data : "-";
			},
		},
		{
			title: "Harga Satuan",
			dataIndex: "",
			render: (data: string) => {
				return data ? data : "-";
			},
		},
		{
			title: "Subtotal",
			dataIndex: "",
			render: (data: string) => {
				return data ? data : "-";
			},
		},
	];

	return (
		<>
			<Flex justify='flex-end' style={{ marginBottom: 24 }}>
				<Button type='primary' onClick={handleOpenModal}>Add Orders</Button>
			</Flex>
			<Table dataSource={orderList} columns={columns} />

			<Modal
				title="Add Orders - Merchant"
				loading={isLoading.list}
				centered
				closable={{ 'aria-label': 'Custom Close Button' }}
				open={isOpen.add_orders}
				onOk={handleAddOrders}
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
						setSelectedProduct(prev => ({ ...prev }))
					}}
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
							style={{width: '100%'}}
							placeholder={selectedProduct ? `Max: ${getMaxStock()}` : 'Select product first'}
						/>
					</Form.Item>
					
					<Form.Item label="Harga Satuan">
						<Typography.Text>
							{selectedProduct ? formatCurrency(getUnitPrice()) : '-'}
						</Typography.Text>
					</Form.Item>
					
					<Form.Item label="Harga Total">
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