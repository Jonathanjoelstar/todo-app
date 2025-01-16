<template>
	<div class="w-1/8 flex relative">
		<Popover class="relative">
			<PopoverButton data-popover-target="popover-bottom-start" class="outline-none">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray"
					preserveAspectRatio="none" class="h-6 w-6 -skew-x-[8deg] -skew-y-[15deg] scale-[0.8]">
					<path stroke-linecap="round" stroke-linejoin="round"
						d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
				</svg>
			</PopoverButton>
			<PopoverPanel data-popover="popover-bottom-start" data-popover-placement="bottom-start" as="Listbox">
				<Listbox
					class="block absolute -right-0 top-10 z-10 p-4 font-sans text-sm font-normal break-words whitespace-normal bg-white rounded-lg shadow-lg w-max border-blue-gray-50 text-blue-gray-500 shadow-blue-gray-500/10 h-60 w-64"
					as="div" v-model="internalSelectedTags" multiple>
					<div>
						<AddTag @tag-added="addTag" />
					</div>

					<ListboxOptions class="max-h-40 w-full overflow-auto scrollbar" static>
						<ListboxOption as="template" v-for="tag in fetchedTags || []" :key="tag.id" :value="tag">
							<li class="cursor-pointer select-none py-2 pl-3 pr-9" @click="toggleTag(tag)">
								<div class=" flex space-x-2 cursor-pointer">
									<svg xmlns=" http://www.w3.org/2000/svg" width="16" height="16" :fill="tag.color"
										class="bi bi-circle-fill" viewBox="0 0 16 16">
										<circle cx="8" cy="10" r="6" />
									</svg>
									<span>{{ tag.name }}</span>

									<CheckIcon v-if="internalSelectedTags.includes(tag)"
										class="w-4 h-4 text-blue-500" />
								</div>

							</li>
						</ListboxOption>
					</ListboxOptions>
				</Listbox>
			</PopoverPanel>
		</Popover>
	</div>
</template>

<script scoped lang="js" src="../services/TagList.js" />