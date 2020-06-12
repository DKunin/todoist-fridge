'use strict';

const template = `<div>
        <div class="row">
            <div class="column">
                <div class="single-filter">
                    <select v-model="sort">
                        <option value="">-</option>
                        <option value="desc">A-Z</option>
                        <option value="asc">Z-A</option>
                    </select>
                </div>
            </div>
            <div class="column">
                <div class="single-filter">
                    <select v-model="show">
                        <option value="">all</option>
                        <option value="none">none</option>
                        <option value="full">full</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="row">
            <input class="main-search" type="text" v-model="filter" placeholder="search" />
        </div>
        <div class="row">
            <div class="column">
                <ul class="items-list" name="fade-list" is="transition-group">
                    <li v-for="item in itemsList" class="fridge-item" v-bind:key="item">
                        <form @change="handleChange">
                            <label class="item-status-label" >
                                <input
                                    class="item-status-icon"
                                    :checked="checkIfChecked(item)" type="checkbox" :name="item.id"/>
                                <i class='bx bx-checkbox-interactive bx-icon-size'></i>
                            </label>
                        </form>
                        <div class="fridge-item-name" @dblclick="editItem(item)">{{ item.content }}</div>
                    </li>
                </ul>
            </div>
        </div>
        
        <div class="row center">
            <div class="column center">
                <button @click="sync" class="btn" :disabled="loadingStatus === 'loading'">
                    <span v-if="loadingStatus === 'saved'">
                        Update
                    </span>
                    <span v-if="loadingStatus === 'loading'">
                        Updating
                    </span>
                </button>
            </div>
        </div>

    </div>`;

let syncTimeout = setTimeout(() => {}, 0);

const listPage = {
    computed: {
        itemsList() {
            const { sort, show, filter } = this;

            let sorted;

            if (!Boolean(sort)) {
                sorted = this.$store.state.list.sort(
                    (singleItemA, singleItemB) => {
                        return singleItemA.id > singleItemB.id;
                    }
                );
            }

            sorted = this.$store.state.list.sort((singleItemA, singleItemB) => {
                if (singleItemA.content < singleItemB.content) {
                    return sort === 'desc' ? -1 : 1;
                }
                if (singleItemA.content > singleItemB.content) {
                    return sort === 'desc' ? 1 : -1;
                }
                return 0;
            });

            if (filter) {
                return sorted.filter(singleItem => {
                    return singleItem.content.toLowerCase().includes((filter || '').toLowerCase())
                });
            }

            return sorted.filter(singleItems => {
                return show === 'full' && singleItems.priority > 1 || show === 'none' && singleItems.priority <= 1 || show === '';
            });
        },
        labels() {
            return this.$store.state.labels;
        },
        loadingStatus() {
            return this.$store.state.loadingStatus;
        }
    },
    methods: {
        handleChange(event) {
            this.$store.commit('updateVolume', {
                id: event.target.name,
                value: event.target.checked
            });
            clearTimeout(syncTimeout);
            syncTimeout = setTimeout(() => {
                this.$store.commit('sync');
            }, 1000)
        },
        sync(event) {
            this.$store.commit('sync');
        },
        mapLabels(singleLabel) {
            return singleLabel.replace('volume_', '');
        },
        editItem(item) {
            this.$router.push({ path: `/edit/${item.id}`, query: { content: escape(item.content) }})
        },
        checkIfChecked(item) {
            return item.priority > 1;
        }
    },
    data() {
        return {
            sort: this.$store.state.settings.sort,
            show: this.$store.state.settings.show,
            filter: this.$store.state.settings.filter
        };
    },
    watch: {
        sort(newVal, oldVal) {
            this.$store.commit('updateSettings', {
                key: 'sort',
                value: newVal
            });
        },
        show(newVal, oldVal) {
            this.$store.commit('updateSettings', {
                key: 'show',
                value: newVal
            });
        },
        filter(newVal, oldVal) {
            this.$store.commit('updateSettings', {
                key: 'filter',
                value: newVal
            });
        }
    },
    template
};

export default listPage;
