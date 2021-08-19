
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const key = 'd1b548f8f98e98ae6340f63730fdf243';

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const weatherList = (() => {
        const { subscribe, update } = writable([]);
        return {
            subscribe,
            add: (weatherInfo) => update(wList =>
              [...wList, weatherInfo]
            ),
            remove: (index) => update(wList => {
                wList.splice(index, 1);
                return wList;
            }),
        }
    })();

    const showFirst = writable(true);

    /* src\components\CitySearch.svelte generated by Svelte v3.42.1 */
    const file$3 = "src\\components\\CitySearch.svelte";

    // (60:2) {#if $showFirst == false }
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = `${/*alert*/ ctx[3]}`;
    			attr_dev(div0, "class", "alert alert-danger");
    			attr_dev(div0, "role", "alert");
    			add_location(div0, file$3, 61, 6, 1829);
    			attr_dev(div1, "class", "row centerScreen");
    			add_location(div1, file$3, 60, 4, 1791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(60:2) {#if $showFirst == false }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let h3;
    	let div1;
    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let div0;
    	let button;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block = /*$showFirst*/ ctx[1] == false && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			div1 = element("div");
    			t0 = text(/*how*/ ctx[2]);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Now";
    			t4 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "class", "cityInput svelte-1uk6st6");
    			attr_dev(input, "type", "text");
    			input.autofocus = true;
    			add_location(input, file$3, 50, 10, 1460);
    			attr_dev(button, "class", "btn btn-outline-secondary");
    			attr_dev(button, "type", "button");
    			add_location(button, file$3, 52, 6, 1578);
    			attr_dev(div0, "class", "input-group-prepend");
    			add_location(div0, file$3, 51, 4, 1537);
    			attr_dev(div1, "class", "input-group mb-3");
    			add_location(div1, file$3, 49, 2, 1418);
    			add_location(h3, file$3, 47, 0, 1384);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			append_dev(h3, div1);
    			append_dev(div1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, input);
    			set_input_value(input, /*cityName*/ ctx[0]);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(h3, t4);
    			if (if_block) if_block.m(h3, null);
    			input.focus();

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*addWeatherInfo*/ ctx[4](/*cityName*/ ctx[0]))) /*addWeatherInfo*/ ctx[4](/*cityName*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*cityName*/ 1 && input.value !== /*cityName*/ ctx[0]) {
    				set_input_value(input, /*cityName*/ ctx[0]);
    			}

    			if (/*$showFirst*/ ctx[1] == false) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(h3, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $weatherList;
    	let $showFirst;
    	validate_store(weatherList, 'weatherList');
    	component_subscribe($$self, weatherList, $$value => $$invalidate(6, $weatherList = $$value));
    	validate_store(showFirst, 'showFirst');
    	component_subscribe($$self, showFirst, $$value => $$invalidate(1, $showFirst = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CitySearch', slots, []);
    	let how = 'How is the weather in';
    	let now = 'now';
    	let cityName = '';
    	let cityList;
    	let alert = "Sorry. We couldn't find the specified city.";

    	// Generate a url for API search
    	function getFetchUrl(searchCity) {
    		return 'http://api.openweathermap.org/data/2.5/weather?units=metric&appid=' + key + '&q=' + searchCity;
    	}

    	// If have a valid city update weatherList, and show first city in middle of screen
    	async function addWeatherInfo() {
    		const res = await fetch(getFetchUrl(cityName));

    		// If status = 404, hide first city and show error message;
    		if (res.status === 404) {
    			showFirst.set(false);
    		} else // Else, hide error message, show first city in middle of screen and update list;
    		{
    			showFirst.set(true);
    			let data = await res.json();

    			// Only can have 5 results in array
    			if ($weatherList.length < 5) {
    				weatherList.add(await data);
    			} else {
    				weatherList.remove($weatherList[0]);
    				weatherList.add(await data);
    			}
    		}

    		$$invalidate(0, cityName = '');
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CitySearch> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		cityName = this.value;
    		$$invalidate(0, cityName);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		key,
    		weatherList,
    		showFirst,
    		how,
    		now,
    		cityName,
    		cityList,
    		alert,
    		getFetchUrl,
    		addWeatherInfo,
    		$weatherList,
    		$showFirst
    	});

    	$$self.$inject_state = $$props => {
    		if ('how' in $$props) $$invalidate(2, how = $$props.how);
    		if ('now' in $$props) now = $$props.now;
    		if ('cityName' in $$props) $$invalidate(0, cityName = $$props.cityName);
    		if ('cityList' in $$props) cityList = $$props.cityList;
    		if ('alert' in $$props) $$invalidate(3, alert = $$props.alert);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName, $showFirst, how, alert, addWeatherInfo, input_input_handler];
    }

    class CitySearch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CitySearch",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.42.1 */

    const file$2 = "src\\components\\Card.svelte";

    // (20:6) {#if showIcons==true}
    function create_if_block$1(ctx) {
    	let a;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			i = element("i");
    			attr_dev(i, "class", /*actionIcon*/ ctx[3]);
    			add_location(i, file$2, 20, 40, 776);
    			attr_dev(a, "href", "/");
    			add_location(a, file$2, 20, 8, 744);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i);

    			if (!mounted) {
    				dispose = listen_dev(
    					a,
    					"click",
    					function () {
    						if (is_function(/*cityName*/ ctx[0])) /*cityName*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*actionIcon*/ 8) {
    				attr_dev(i, "class", /*actionIcon*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:6) {#if showIcons==true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let h5;
    	let t0;
    	let t1;
    	let h1;
    	let img;
    	let img_src_value;
    	let t2;
    	let h2;
    	let t3_value = Math.round(/*temp*/ ctx[1]) + "";
    	let t3;
    	let t4;
    	let t5;
    	let h6;
    	let t6_value = /*climate*/ ctx[2].charAt(0).toUpperCase() + /*climate*/ ctx[2].slice(1) + "";
    	let t6;
    	let t7;
    	let if_block = /*showIcons*/ ctx[4] == true && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			t0 = text(/*cityName*/ ctx[0]);
    			t1 = space();
    			h1 = element("h1");
    			img = element("img");
    			t2 = space();
    			h2 = element("h2");
    			t3 = text(t3_value);
    			t4 = text("C°");
    			t5 = space();
    			h6 = element("h6");
    			t6 = text(t6_value);
    			t7 = space();
    			if (if_block) if_block.c();
    			attr_dev(h5, "class", "card-title text-centered");
    			add_location(h5, file$2, 11, 6, 306);
    			attr_dev(img, "id", "wicon");
    			if (!src_url_equal(img.src, img_src_value = "http://openweathermap.org/img/w/" + /*weatherIcon*/ ctx[5] + ".png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Weather icon");
    			add_location(img, file$2, 13, 12, 404);
    			add_location(h1, file$2, 13, 8, 400);
    			attr_dev(h2, "class", "card-text");
    			add_location(h2, file$2, 15, 6, 536);
    			add_location(h6, file$2, 17, 6, 615);
    			attr_dev(div0, "class", "card-body card-shadow ");
    			add_location(div0, file$2, 9, 4, 235);
    			attr_dev(div1, "class", "card border-secondary  mx-2");
    			set_style(div1, "width", "12rem");
    			add_location(div1, file$2, 8, 0, 166);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(h5, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h1);
    			append_dev(h1, img);
    			append_dev(div0, t2);
    			append_dev(div0, h2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			append_dev(div0, t5);
    			append_dev(div0, h6);
    			append_dev(h6, t6);
    			append_dev(div0, t7);
    			if (if_block) if_block.m(div0, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*cityName*/ 1) set_data_dev(t0, /*cityName*/ ctx[0]);

    			if (dirty & /*weatherIcon*/ 32 && !src_url_equal(img.src, img_src_value = "http://openweathermap.org/img/w/" + /*weatherIcon*/ ctx[5] + ".png")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*temp*/ 2 && t3_value !== (t3_value = Math.round(/*temp*/ ctx[1]) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*climate*/ 4 && t6_value !== (t6_value = /*climate*/ ctx[2].charAt(0).toUpperCase() + /*climate*/ ctx[2].slice(1) + "")) set_data_dev(t6, t6_value);

    			if (/*showIcons*/ ctx[4] == true) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, []);
    	let { cityName } = $$props;
    	let { temp } = $$props;
    	let { climate } = $$props;
    	let { actionIcon } = $$props;
    	let { showIcons } = $$props;
    	let { weatherIcon } = $$props;
    	const writable_props = ['cityName', 'temp', 'climate', 'actionIcon', 'showIcons', 'weatherIcon'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('cityName' in $$props) $$invalidate(0, cityName = $$props.cityName);
    		if ('temp' in $$props) $$invalidate(1, temp = $$props.temp);
    		if ('climate' in $$props) $$invalidate(2, climate = $$props.climate);
    		if ('actionIcon' in $$props) $$invalidate(3, actionIcon = $$props.actionIcon);
    		if ('showIcons' in $$props) $$invalidate(4, showIcons = $$props.showIcons);
    		if ('weatherIcon' in $$props) $$invalidate(5, weatherIcon = $$props.weatherIcon);
    	};

    	$$self.$capture_state = () => ({
    		cityName,
    		temp,
    		climate,
    		actionIcon,
    		showIcons,
    		weatherIcon
    	});

    	$$self.$inject_state = $$props => {
    		if ('cityName' in $$props) $$invalidate(0, cityName = $$props.cityName);
    		if ('temp' in $$props) $$invalidate(1, temp = $$props.temp);
    		if ('climate' in $$props) $$invalidate(2, climate = $$props.climate);
    		if ('actionIcon' in $$props) $$invalidate(3, actionIcon = $$props.actionIcon);
    		if ('showIcons' in $$props) $$invalidate(4, showIcons = $$props.showIcons);
    		if ('weatherIcon' in $$props) $$invalidate(5, weatherIcon = $$props.weatherIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [cityName, temp, climate, actionIcon, showIcons, weatherIcon];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			cityName: 0,
    			temp: 1,
    			climate: 2,
    			actionIcon: 3,
    			showIcons: 4,
    			weatherIcon: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cityName*/ ctx[0] === undefined && !('cityName' in props)) {
    			console.warn("<Card> was created without expected prop 'cityName'");
    		}

    		if (/*temp*/ ctx[1] === undefined && !('temp' in props)) {
    			console.warn("<Card> was created without expected prop 'temp'");
    		}

    		if (/*climate*/ ctx[2] === undefined && !('climate' in props)) {
    			console.warn("<Card> was created without expected prop 'climate'");
    		}

    		if (/*actionIcon*/ ctx[3] === undefined && !('actionIcon' in props)) {
    			console.warn("<Card> was created without expected prop 'actionIcon'");
    		}

    		if (/*showIcons*/ ctx[4] === undefined && !('showIcons' in props)) {
    			console.warn("<Card> was created without expected prop 'showIcons'");
    		}

    		if (/*weatherIcon*/ ctx[5] === undefined && !('weatherIcon' in props)) {
    			console.warn("<Card> was created without expected prop 'weatherIcon'");
    		}
    	}

    	get cityName() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cityName(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get temp() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set temp(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get climate() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set climate(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get actionIcon() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set actionIcon(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIcons() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIcons(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weatherIcon() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weatherIcon(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\AppHeader.svelte generated by Svelte v3.42.1 */

    const file$1 = "src\\components\\AppHeader.svelte";

    function create_fragment$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let h3;
    	let t1;
    	let t2;
    	let hr;
    	let t3;
    	let div2;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t1 = text(/*name*/ ctx[0]);
    			t2 = space();
    			hr = element("hr");
    			t3 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "col-lg-3 col-sm-1");
    			add_location(div0, file$1, 3, 0, 41);
    			attr_dev(h3, "class", "text-center");
    			add_location(h3, file$1, 5, 2, 130);
    			attr_dev(hr, "class", "divider");
    			add_location(hr, file$1, 6, 2, 169);
    			attr_dev(div1, "class", "col-lg-6 col-sm-12 align-self-center");
    			add_location(div1, file$1, 4, 0, 76);
    			attr_dev(div2, "class", "col-lg-3 col-sm-1");
    			add_location(div2, file$1, 8, 0, 199);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			append_dev(div1, hr);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t1, /*name*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppHeader', slots, []);
    	let { name } = $$props;
    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ name });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class AppHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppHeader",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !('name' in props)) {
    			console.warn("<AppHeader> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<AppHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<AppHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.1 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (27:1) {#if $showFirst == true && $cityList.length > 0}
    function create_if_block_1(ctx) {
    	let div;
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				cityName: /*$cityList*/ ctx[1][0]['name'],
    				temp: /*$cityList*/ ctx[1][0]['main']['temp'],
    				climate: /*$cityList*/ ctx[1][0]['weather'][0]['description'],
    				weatherIcon: /*$cityList*/ ctx[1][0]['weather'][0]['icon'],
    				actionIcon: "bi bi-plus-circle-fill",
    				showIcons: /*showIcons*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(card.$$.fragment);
    			attr_dev(div, "class", "row justify-content-center py-3");
    			add_location(div, file, 27, 1, 792);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(card, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*$cityList*/ 2) card_changes.cityName = /*$cityList*/ ctx[1][0]['name'];
    			if (dirty & /*$cityList*/ 2) card_changes.temp = /*$cityList*/ ctx[1][0]['main']['temp'];
    			if (dirty & /*$cityList*/ 2) card_changes.climate = /*$cityList*/ ctx[1][0]['weather'][0]['description'];
    			if (dirty & /*$cityList*/ 2) card_changes.weatherIcon = /*$cityList*/ ctx[1][0]['weather'][0]['icon'];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(card);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(27:1) {#if $showFirst == true && $cityList.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (39:1) {#if $cityList.length > 0}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*$cityList*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "row justify-content-center");
    			add_location(div0, file, 40, 1, 1205);
    			attr_dev(div1, "class", "centerScreen py-3");
    			add_location(div1, file, 39, 1, 1171);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$cityList, showIcons*/ 18) {
    				each_value = /*$cityList*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(39:1) {#if $cityList.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (42:2) {#each $cityList as weather, index}
    function create_each_block(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				cityName: /*weather*/ ctx[6]['name'],
    				temp: /*weather*/ ctx[6]['main']['temp'],
    				climate: /*weather*/ ctx[6]['weather'][0]['description'],
    				weatherIcon: /*weather*/ ctx[6]['weather'][0]['icon'],
    				actionIcon: "bi bi-plus-circle-fill",
    				showIcons: /*showIcons*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_changes = {};
    			if (dirty & /*$cityList*/ 2) card_changes.cityName = /*weather*/ ctx[6]['name'];
    			if (dirty & /*$cityList*/ 2) card_changes.temp = /*weather*/ ctx[6]['main']['temp'];
    			if (dirty & /*$cityList*/ 2) card_changes.climate = /*weather*/ ctx[6]['weather'][0]['description'];
    			if (dirty & /*$cityList*/ 2) card_changes.weatherIcon = /*weather*/ ctx[6]['weather'][0]['icon'];
    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(42:2) {#each $cityList as weather, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let appheader;
    	let t0;
    	let div3;
    	let div2;
    	let div1;
    	let citysearch;
    	let t1;
    	let t2;
    	let current;

    	appheader = new AppHeader({
    			props: { name: /*appname*/ ctx[2] },
    			$$inline: true
    		});

    	citysearch = new CitySearch({ $$inline: true });
    	let if_block0 = /*$showFirst*/ ctx[0] == true && /*$cityList*/ ctx[1].length > 0 && create_if_block_1(ctx);
    	let if_block1 = /*$cityList*/ ctx[1].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(appheader.$$.fragment);
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(citysearch.$$.fragment);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "d-flex justify-content-center py-3");
    			add_location(div0, file, 15, 0, 424);
    			attr_dev(div1, "class", "centerScreen");
    			add_location(div1, file, 21, 1, 623);
    			attr_dev(div2, "class", "row justify-content-center py-3");
    			add_location(div2, file, 20, 1, 575);
    			attr_dev(div3, "class", "row-full pt-5");
    			add_location(div3, file, 18, 0, 513);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(appheader, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			mount_component(citysearch, div1, null);
    			append_dev(div3, t1);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t2);
    			if (if_block1) if_block1.m(div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$showFirst*/ ctx[0] == true && /*$cityList*/ ctx[1].length > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$showFirst, $cityList*/ 3) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$cityList*/ ctx[1].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$cityList*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appheader.$$.fragment, local);
    			transition_in(citysearch.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appheader.$$.fragment, local);
    			transition_out(citysearch.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(appheader);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			destroy_component(citysearch);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $showFirst;
    	let $cityList;
    	validate_store(showFirst, 'showFirst');
    	component_subscribe($$self, showFirst, $$value => $$invalidate(0, $showFirst = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let appname = 'WEATHER BUDDY';
    	let cityList = weatherList;
    	validate_store(cityList, 'cityList');
    	component_subscribe($$self, cityList, value => $$invalidate(1, $cityList = value));
    	let searchCity = '';
    	let showIcons = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		CitySearch,
    		Card,
    		AppHeader,
    		weatherList,
    		showFirst,
    		appname,
    		cityList,
    		searchCity,
    		showIcons,
    		$showFirst,
    		$cityList
    	});

    	$$self.$inject_state = $$props => {
    		if ('appname' in $$props) $$invalidate(2, appname = $$props.appname);
    		if ('cityList' in $$props) $$invalidate(3, cityList = $$props.cityList);
    		if ('searchCity' in $$props) searchCity = $$props.searchCity;
    		if ('showIcons' in $$props) $$invalidate(4, showIcons = $$props.showIcons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$showFirst, $cityList, appname, cityList, showIcons];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
