// behaviors/schoolPicker.ts
import { dictionaryApi } from '../api/index'
import type { components } from '../api/schema'

type SchoolVO = components['schemas']['SchoolVO']

/**
 * 学校选择器 Behavior
 * 提供学校列表加载、搜索和选择功能
 */
export const schoolPickerBehavior = Behavior({
    data: {
        // 学校列表
        schools: [] as SchoolVO[],
        // 选择器状态
        showSchoolPicker: false,
        schoolSearchKeyword: '',
        // 选中的学校
        selectedSchoolId: undefined as number | undefined,
        selectedSchoolName: ''
    },

    methods: {
        /**
         * 加载学校列表
         */
        async loadSchools(keyword?: string) {
            try {
                const res = await dictionaryApi.listSchools(keyword)
                this.setData({ schools: res.data || [] })
            } catch (error) {
                console.error('加载学校列表失败:', error)
            }
        },

        /**
         * 显示学校选择器
         */
        showSchoolPicker() {
            this.setData({ showSchoolPicker: true })
            // 确保有学校数据
            if (this.data.schools.length === 0) {
                this.loadSchools()
            }
        },

        /**
         * 关闭学校选择器
         */
        closeSchoolPicker() {
            this.setData({
                showSchoolPicker: false,
                schoolSearchKeyword: ''
            })
        },

        /**
         * 搜索学校
         */
        handleSchoolSearch(e: any) {
            const keyword = e.detail
            this.setData({ schoolSearchKeyword: keyword })
            this.loadSchools(keyword)
        },

        /**
         * 选择学校
         */
        handleSelectSchool(e: WechatMiniprogram.TouchEvent) {
            const { school } = e.currentTarget.dataset as { school: SchoolVO }
            this.setData({
                selectedSchoolId: school.id,
                selectedSchoolName: school.schoolName || '',
                showSchoolPicker: false,
                schoolSearchKeyword: ''
            })
            // 触发回调，子类可覆盖
            if (typeof (this as any).onSchoolSelected === 'function') {
                (this as any).onSchoolSelected(school)
            }
        },

        /**
         * 获取学校显示名称列表（用于简单选择器）
         */
        getSchoolNames(): string[] {
            return this.data.schools.map(s => s.schoolName || '')
        },

        /**
         * 根据索引获取学校
         */
        getSchoolByIndex(index: number): SchoolVO | undefined {
            return this.data.schools[index]
        }
    }
})

export default schoolPickerBehavior
