<template>
  <PageList :form-config="formConfig" :columns="columns" request="/api/example" />

  <PageList :form-config="formConfig" :columns="columns" :table-data="tableData" selection>
    <div>
      <el-button>btn1</el-button>
      <el-button>btn2</el-button>
      <el-button>btn3</el-button>
    </div>
    <template #extra-btns>
      <el-button>btn1</el-button>
      <el-button>btn2</el-button>
      <el-button>btn3</el-button>
    </template>
  </PageList>
  <FormDialog
    ref="dialogRef"
    :form-config="formConfig"
    :init-form-data="initData"
    title="操作"
    :confirm-cb="handleConfirm"
  />
</template>

<script setup>
import { h, ref } from 'vue'
import { ElButton } from 'element-plus'
import PageList from '@components/PageList/index.vue'
import FormDialog from '@components/FormDialog/index.vue'
const formConfig = [
  {
    type: 'input',
    label: '年龄',
    key: 'age'
  },
  {
    key: 'name',
    type: 'input',
    label: '姓名'
  }
]

const initData = ref({})
const dialogRef = ref()
const handleClick = ({ row }) => {
  console.log(row)
  initData.value = { ...row }
  dialogRef.value.visible = true
}

const handleConfirm = (e) => {
  console.log(e)
}

const columns = [
  {
    prop: 'name',
    label: '姓名'
  },
  {
    prop: 'age',
    label: '年龄'
  },
  {
    label: '操作',
    render: ({ ctx }) => {
      return h('div', [
        h(
          ElButton,
          {
            link: true,
            type: 'primary',
            onClick: () => handleClick(ctx)
          },
          { default: () => '查看' }
        ),
        h(
          ElButton,
          {
            link: true,
            type: 'danger'
          },
          { default: () => '删除' }
        )
      ])
    }
  }
]

const tableData = new Array(200).fill('').map((v, index) => {
  return {
    name: `name${index}`,
    age: index
  }
})
</script>

<style lang="scss">
html,
body {
  background-color: #efefef;
}
</style>
