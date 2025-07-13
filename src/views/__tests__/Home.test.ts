import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Home from '../Home.vue'

describe('Home', () => {
  it('should render correctly', () => {
    const wrapper = mount(Home)
    expect(wrapper.exists()).toBe(true)
  })

  it('should display welcome message', () => {
    const wrapper = mount(Home)
    expect(wrapper.text()).toContain('Welcome to Kodero!')
  })

  it('should increment counter when button is clicked', async () => {
    const wrapper = mount(Home)
    const button = wrapper.find('button')

    expect(button.text()).toContain('Count is: 0')

    await button.trigger('click')
    expect(button.text()).toContain('Count is: 1')

    await button.trigger('click')
    expect(button.text()).toContain('Count is: 2')
  })
})
